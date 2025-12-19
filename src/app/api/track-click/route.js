import sql from "@/app/api/utils/sql";

// Track link click
export async function POST(request) {
  try {
    const body = await request.json();
    const { biolink_id, link_id } = body;

    if (!biolink_id || !link_id) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO analytics (biolink_id, link_id, event_type)
      VALUES (${biolink_id}, ${link_id}, 'click')
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/track-click error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
