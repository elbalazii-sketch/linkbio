import { useState, useEffect } from "react";

export default function PublicBiolinkPage({ params }) {
  const { username } = params;
  const [biolink, setBiolink] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBiolink = async () => {
      try {
        const response = await fetch(`/api/public/${username}`);
        if (!response.ok) {
          throw new Error("Biolink not found");
        }
        const data = await response.json();
        setBiolink(data.biolink);
        setLinks(data.links);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchBiolink();
    }
  }, [username]);

  const handleLinkClick = async (link) => {
    // Track click
    try {
      await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          biolink_id: biolink.id,
          link_id: link.id,
        }),
      });
    } catch (err) {
      console.error("Failed to track click:", err);
    }

    // Open link
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212]">
        <div className="text-black dark:text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !biolink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#121212] p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            404
          </h1>
          <p className="text-xl text-[#7B7B7B] dark:text-[#A0A0A0] mb-8">
            Biolink not found
          </p>
          <a
            href="/"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-semibold hover:bg-[#1a1a1a] dark:hover:bg-[#F0F0F0] transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const theme = biolink.theme || {
    background: "#FFFFFF",
    buttonColor: "#000000",
    buttonTextColor: "#FFFFFF",
    textColor: "#000000",
    fontFamily: "Inter",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: theme.background,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          {biolink.avatar_url ? (
            <img
              src={biolink.avatar_url}
              alt={biolink.title}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mb-6 border-4"
              style={{ borderColor: theme.buttonColor }}
            />
          ) : (
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-6 flex items-center justify-center text-4xl font-bold"
              style={{
                backgroundColor: theme.buttonColor,
                color: theme.buttonTextColor,
              }}
            >
              {biolink.title.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl font-bold mb-4 text-center"
            style={{ color: theme.textColor }}
          >
            {biolink.title}
          </h1>

          {/* Bio */}
          {biolink.bio && (
            <p
              className="text-lg md:text-xl text-center mb-8 max-w-lg opacity-90"
              style={{ color: theme.textColor }}
            >
              {biolink.bio}
            </p>
          )}

          {/* Links */}
          <div className="w-full space-y-4 mb-8">
            {links.length === 0 ? (
              <p className="text-center opacity-50 py-8">No links yet</p>
            ) : (
              links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className="w-full px-6 py-4 md:px-8 md:py-5 rounded-full font-semibold text-center text-lg transition-all hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: theme.buttonColor,
                    color: theme.buttonTextColor,
                  }}
                >
                  {link.title}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <a
              href="/"
              className="text-sm opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: theme.textColor }}
            >
              Create your own biolink →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
