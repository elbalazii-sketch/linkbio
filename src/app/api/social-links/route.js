import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const biolink_id = searchParams.get("biolink_id");

  if (!biolink_id) {
    return Response.json({ error: "Biolink ID required" }, { status: 400 });
  }

  try {
    const socialLinks = await sql`
      SELECT * FROM social_links 
      WHERE biolink_id = ${biolink_id}
      ORDER BY position ASC
    `;

    return Response.json({ socialLinks });
  } catch (error) {
    console.error("Error fetching social links:", error);
    return Response.json(
      { error: "Failed to fetch social links" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { biolink_id, platform, url, position = 0, visible = true } = body;

    if (!biolink_id || !platform || !url) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify ownership
    const biolink = await sql`
      SELECT * FROM biolinks 
      WHERE id = ${biolink_id} AND user_id = ${session.user.id}
    `;

    if (biolink.length === 0) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await sql`
      INSERT INTO social_links (biolink_id, platform, url, position, visible)
      VALUES (${biolink_id}, ${platform}, ${url}, ${position}, ${visible})
      RETURNING *
    `;

    return Response.json({ socialLink: result[0] });
  } catch (error) {
    console.error("Error creating social link:", error);
    return Response.json(
      { error: "Failed to create social link" },
      { status: 500 },
    );
  }
}
