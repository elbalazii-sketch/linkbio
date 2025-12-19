import { adapter } from "@/auth";
import { hash } from "argon2";
import { auth } from "@/auth";

export async function POST(request) {
  const session = await auth();
  
  // 1. Check if the current user is an admin
  if (!session || !session.user || !session.user.is_admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { email, password, name, is_admin } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Check if user already exists
    const existingUser = await adapter.getUserByEmail(email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User with this email already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Create the new user
    const newUser = await adapter.createUser({
      id: crypto.randomUUID(),
      emailVerified: null,
      email,
      name: name || "Admin User",
      image: null,
      is_admin: is_admin || false, // Allow creating non-admin users too
    });

    // 4. Link the credentials account
    await adapter.linkAccount({
      extraData: {
        password: await hash(password),
      },
      type: 'credentials',
      userId: newUser.id,
      providerAccountId: newUser.id,
      provider: 'credentials',
    });

    return new Response(JSON.stringify({ message: "User created successfully", user: { id: newUser.id, email: newUser.email, is_admin: newUser.is_admin } }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin create user API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
