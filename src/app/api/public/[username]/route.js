import sql from "@/app/api/utils/sql";

// Get public biolink data
export async function GET(request, { params }) {
  try {
    const { username } = params;

    const result = await sql`
      SELECT id, username, title, bio, theme, avatar_url, published
      FROM biolinks 
      WHERE username = ${username} AND published = true
    `;

    if (result.length === 0) {
      return Response.json({ error: "Biolink not found" }, { status: 404 });
    }

    const biolink = result[0];

    // Get visible links
    const links = await sql`
      SELECT id, title, url, icon
      FROM links 
      WHERE biolink_id = ${biolink.id} AND visible = true
      ORDER BY position ASC
    `;

    // Record view
    await sql`
      INSERT INTO analytics (biolink_id, event_type)
      VALUES (${biolink.id}, 'view')
    `;

    return Response.json({ biolink, links });
  } catch (error) {
    console.error("GET /api/public/[username] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
