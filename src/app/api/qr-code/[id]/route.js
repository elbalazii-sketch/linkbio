import { auth } from "@/auth";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const size = searchParams.get("size") || "300";

    // Generate QR code URL using API
    const biolink_url = `${process.env.APP_URL}/${id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(biolink_url)}`;

    return Response.json({
      qrCodeUrl,
      biolinkUrl: biolink_url,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return Response.json(
      { error: "Failed to generate QR code" },
      { status: 500 },
    );
  }
}
