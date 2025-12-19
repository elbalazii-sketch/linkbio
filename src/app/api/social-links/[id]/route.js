import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { platform, url, visible, position } = body;

    // Verify ownership
    const socialLink = await sql`
      SELECT sl.*, b.user_id 
      FROM social_links sl
      JOIN biolinks b ON sl.biolink_id = b.id
      WHERE sl.id = ${id}
    `;

    if (socialLink.length === 0) {
      return Response.json({ error: "Social link not found" }, { status: 404 });
    }

    if (socialLink[0].user_id !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (platform !== undefined) {
      updates.push(`platform = $${paramCount++}`);
      values.push(platform);
    }
    if (url !== undefined) {
      updates.push(`url = $${paramCount++}`);
      values.push(url);
    }
    if (visible !== undefined) {
      updates.push(`visible = $${paramCount++}`);
      values.push(visible);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const result = await sql(
      `UPDATE social_links SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    return Response.json({ socialLink: result[0] });
  } catch (error) {
    console.error("Error updating social link:", error);
    return Response.json(
      { error: "Failed to update social link" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Verify ownership
    const socialLink = await sql`
      SELECT sl.*, b.user_id 
      FROM social_links sl
      JOIN biolinks b ON sl.biolink_id = b.id
      WHERE sl.id = ${id}
    `;

    if (socialLink.length === 0) {
      return Response.json({ error: "Social link not found" }, { status: 404 });
    }

    if (socialLink[0].user_id !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await sql`DELETE FROM social_links WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting social link:", error);
    return Response.json(
      { error: "Failed to delete social link" },
      { status: 500 },
    );
  }
}
