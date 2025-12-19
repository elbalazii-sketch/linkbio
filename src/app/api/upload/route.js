import { upload } from "../utils/upload";
import { parse } from "url";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type");

    if (contentType && contentType.includes("multipart/form-data")) {
      // Handle file upload via FormData
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await upload({ buffer });

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Handle URL or Base64 upload via JSON
      const body = await request.json();
      const { url, base64 } = body;

      if (!url && !base64) {
        return new Response(JSON.stringify({ error: "No URL or base64 provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await upload({ url, base64 });

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Upload API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
