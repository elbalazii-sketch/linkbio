import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get analytics for a biolink
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify biolink ownership
    const biolink = await sql`
      SELECT * FROM biolinks WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (biolink.length === 0) {
      return Response.json({ error: "Biolink not found" }, { status: 404 });
    }

    // Get total views
    const totalViews = await sql`
      SELECT COUNT(*) as count FROM analytics 
      WHERE biolink_id = ${id} AND event_type = 'view'
    `;

    // Get total clicks
    const totalClicks = await sql`
      SELECT COUNT(*) as count FROM analytics 
      WHERE biolink_id = ${id} AND event_type = 'click'
    `;

    // Get clicks per link
    const clicksPerLink = await sql`
      SELECT l.id, l.title, COUNT(a.id) as clicks
      FROM links l
      LEFT JOIN analytics a ON a.link_id = l.id AND a.event_type = 'click'
      WHERE l.biolink_id = ${id}
      GROUP BY l.id, l.title
      ORDER BY clicks DESC
    `;

    // Get views over last 7 days
    const viewsOverTime = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM analytics
      WHERE biolink_id = ${id} AND event_type = 'view'
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return Response.json({
      totalViews: parseInt(totalViews[0].count),
      totalClicks: parseInt(totalClicks[0].count),
      clicksPerLink,
      viewsOverTime,
    });
  } catch (error) {
    console.error("GET /api/analytics/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
