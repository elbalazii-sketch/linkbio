import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new biolink
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, title, bio } = body;

    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    // Check if username is already taken
    const existing = await sql`
      SELECT id FROM biolinks WHERE username = ${username}
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO biolinks (user_id, username, title, bio)
      VALUES (${session.user.id}, ${username}, ${title || "My Biolink"}, ${bio || ""})
      RETURNING *
    `;

    return Response.json({ biolink: result[0] });
  } catch (error) {
    console.error("POST /api/biolinks error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get all biolinks for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const biolinks = await sql`
      SELECT * FROM biolinks 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    return Response.json({ biolinks });
  } catch (error) {
    console.error("GET /api/biolinks error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
