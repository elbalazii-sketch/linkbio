import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new link
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { biolink_id, title, url, icon } = body;

    if (!biolink_id || !title || !url) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify biolink ownership
    const biolink = await sql`
      SELECT * FROM biolinks WHERE id = ${biolink_id} AND user_id = ${session.user.id}
    `;

    if (biolink.length === 0) {
      return Response.json({ error: "Biolink not found" }, { status: 404 });
    }

    // Get the next position
    const maxPosition = await sql`
      SELECT COALESCE(MAX(position), -1) as max_pos FROM links WHERE biolink_id = ${biolink_id}
    `;
    const nextPosition = maxPosition[0].max_pos + 1;

    const result = await sql`
      INSERT INTO links (biolink_id, title, url, icon, position)
      VALUES (${biolink_id}, ${title}, ${url}, ${icon || null}, ${nextPosition})
      RETURNING *
    `;

    return Response.json({ link: result[0] });
  } catch (error) {
    console.error("POST /api/links error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Reorder links
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { biolink_id, link_orders } = body;

    if (!biolink_id || !link_orders || !Array.isArray(link_orders)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify biolink ownership
    const biolink = await sql`
      SELECT * FROM biolinks WHERE id = ${biolink_id} AND user_id = ${session.user.id}
    `;

    if (biolink.length === 0) {
      return Response.json({ error: "Biolink not found" }, { status: 404 });
    }

    // Update positions
    const updates = link_orders.map(
      ({ id, position }, index) =>
        sql`UPDATE links SET position = ${position} WHERE id = ${id} AND biolink_id = ${biolink_id}`,
    );

    await sql.transaction(updates);

    return Response.json({ success: true });
  } catch (error) {
    console.error("PUT /api/links error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
