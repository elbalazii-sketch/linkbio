import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get a single biolink
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const result = await sql`
      SELECT * FROM biolinks 
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Biolink not found" }, { status: 404 });
    }

    // Get links for this biolink
    const links = await sql`
      SELECT * FROM links 
      WHERE biolink_id = ${id}
      ORDER BY position ASC
    `;

    return Response.json({
      biolink: result[0],
      links,
    });
  } catch (error) {
    console.error("GET /api/biolinks/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update a biolink
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      title,
      bio,
      theme,
      avatar_url,
      published,
      custom_domain,
      domain_verified,
    } = body;

    // Verify ownership
    const existing = await sql`
      SELECT * FROM biolinks WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (existing.length === 0) {
      return Response.json({ error: "Biolink not found" }, { status: 404 });
    }

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (bio !== undefined) {
      setClauses.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (theme !== undefined) {
      setClauses.push(`theme = $${paramIndex++}`);
      values.push(JSON.stringify(theme));
    }
    if (avatar_url !== undefined) {
      setClauses.push(`avatar_url = $${paramIndex++}`);
      values.push(avatar_url);
    }
    if (published !== undefined) {
      setClauses.push(`published = $${paramIndex++}`);
      values.push(published);
    }
    if (custom_domain !== undefined) {
      setClauses.push(`custom_domain = $${paramIndex++}`);
      values.push(custom_domain);
    }
    if (domain_verified !== undefined) {
      setClauses.push(`domain_verified = $${paramIndex++}`);
      values.push(domain_verified);
    }

    setClauses.push(`updated_at = NOW()`);

    if (setClauses.length === 1) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const updateQuery = `
      UPDATE biolinks 
      SET ${setClauses.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql(updateQuery, [...values, id]);

    return Response.json({ biolink: result[0] });
  } catch (error) {
    console.error("PUT /api/biolinks/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete a biolink
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership
    const existing = await sql`
      SELECT * FROM biolinks WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (existing.length === 0) {
      return Response.json({ error: "Biolink not found" }, { status: 404 });
    }

    await sql`DELETE FROM biolinks WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/biolinks/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
