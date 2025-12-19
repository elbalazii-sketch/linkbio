import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Verify ownership
    const biolink = await sql`
      SELECT * FROM biolinks 
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (biolink.length === 0) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily views and clicks
    const dailyStats = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE event_type = 'view') as views,
        COUNT(*) FILTER (WHERE event_type = 'click') as clicks
      FROM analytics
      WHERE biolink_id = ${id}
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Top links by clicks
    const topLinks = await sql`
      SELECT 
        l.id,
        l.title,
        l.url,
        COUNT(*) as clicks
      FROM analytics a
      JOIN links l ON a.link_id = l.id
      WHERE a.biolink_id = ${id}
        AND a.event_type = 'click'
        AND a.created_at >= ${startDate.toISOString()}
      GROUP BY l.id, l.title, l.url
      ORDER BY clicks DESC
      LIMIT 10
    `;

    // Device breakdown
    const deviceStats = await sql`
      SELECT 
        device,
        COUNT(*) as count
      FROM analytics
      WHERE biolink_id = ${id}
        AND created_at >= ${startDate.toISOString()}
        AND device IS NOT NULL
      GROUP BY device
      ORDER BY count DESC
    `;

    // Referrer breakdown
    const referrerStats = await sql`
      SELECT 
        referrer,
        COUNT(*) as count
      FROM analytics
      WHERE biolink_id = ${id}
        AND created_at >= ${startDate.toISOString()}
        AND referrer IS NOT NULL
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `;

    // Total stats
    const totalStats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE event_type = 'view') as total_views,
        COUNT(*) FILTER (WHERE event_type = 'click') as total_clicks,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM analytics
      WHERE biolink_id = ${id}
        AND created_at >= ${startDate.toISOString()}
    `;

    // QR code scans
    const qrScans = await sql`
      SELECT COUNT(*) as total_scans
      FROM qr_scans
      WHERE biolink_id = ${id}
        AND scanned_at >= ${startDate.toISOString()}
    `;

    return Response.json({
      dailyStats: dailyStats.map((stat) => ({
        date: stat.date,
        views: parseInt(stat.views),
        clicks: parseInt(stat.clicks),
      })),
      topLinks: topLinks.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        clicks: parseInt(link.clicks),
      })),
      deviceStats: deviceStats.map((stat) => ({
        device: stat.device,
        count: parseInt(stat.count),
      })),
      referrerStats: referrerStats.map((stat) => ({
        referrer: stat.referrer,
        count: parseInt(stat.count),
      })),
      totalStats: {
        totalViews: parseInt(totalStats[0]?.total_views || 0),
        totalClicks: parseInt(totalStats[0]?.total_clicks || 0),
        activeDays: parseInt(totalStats[0]?.active_days || 0),
        qrScans: parseInt(qrScans[0]?.total_scans || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching advanced analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
