import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Update a link
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { title, url, icon, visible } = body;

    // Verify link ownership through biolink
    const linkCheck = await sql`
      SELECT l.* FROM links l
      JOIN biolinks b ON l.biolink_id = b.id
      WHERE l.id = ${id} AND b.user_id = ${session.user.id}
    `;

    if (linkCheck.length === 0) {
      return Response.json({ error: "Link not found" }, { status: 404 });
    }

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (url !== undefined) {
      setClauses.push(`url = $${paramIndex++}`);
      values.push(url);
    }
    if (icon !== undefined) {
      setClauses.push(`icon = $${paramIndex++}`);
      values.push(icon);
    }
    if (visible !== undefined) {
      setClauses.push(`visible = $${paramIndex++}`);
      values.push(visible);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const updateQuery = `
      UPDATE links 
      SET ${setClauses.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql(updateQuery, [...values, id]);

    return Response.json({ link: result[0] });
  } catch (error) {
    console.error("PUT /api/links/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete a link
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify link ownership through biolink
    const linkCheck = await sql`
      SELECT l.* FROM links l
      JOIN biolinks b ON l.biolink_id = b.id
      WHERE l.id = ${id} AND b.user_id = ${session.user.id}
    `;

    if (linkCheck.length === 0) {
      return Response.json({ error: "Link not found" }, { status: 404 });
    }

    await sql`DELETE FROM links WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/links/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
