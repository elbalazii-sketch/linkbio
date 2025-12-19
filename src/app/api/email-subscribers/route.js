import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const biolink_id = searchParams.get("biolink_id");

  if (!biolink_id) {
    return Response.json({ error: "Biolink ID required" }, { status: 400 });
  }

  try {
    // Verify ownership
    const biolink = await sql`
      SELECT * FROM biolinks 
      WHERE id = ${biolink_id} AND user_id = ${session.user.id}
    `;

    if (biolink.length === 0) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const subscribers = await sql`
      SELECT id, email, subscribed_at
      FROM email_subscribers
      WHERE biolink_id = ${biolink_id}
      ORDER BY subscribed_at DESC
    `;

    return Response.json({ subscribers });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return Response.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { biolink_id, email } = body;

    if (!biolink_id || !email) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify biolink exists and has email capture enabled
    const biolink = await sql`
      SELECT enable_email_capture FROM biolinks WHERE id = ${biolink_id}
    `;

    if (biolink.length === 0 || !biolink[0].enable_email_capture) {
      return Response.json(
        { error: "Email capture not enabled" },
        { status: 400 },
      );
    }

    // Check if already subscribed
    const existing = await sql`
      SELECT id FROM email_subscribers
      WHERE biolink_id = ${biolink_id} AND email = ${email}
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: "Email already subscribed" },
        { status: 409 },
      );
    }

    const result = await sql`
      INSERT INTO email_subscribers (biolink_id, email)
      VALUES (${biolink_id}, ${email})
      RETURNING *
    `;

    return Response.json({ subscriber: result[0] });
  } catch (error) {
    console.error("Error adding subscriber:", error);
    return Response.json(
      { error: "Failed to add subscriber" },
      { status: 500 },
    );
  }
}
