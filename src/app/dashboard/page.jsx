import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import {
  Plus,
  ExternalLink,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Check,
  Link2,
} from "lucide-react";

export default function DashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Fetch biolinks
  const { data: biolinksData, isLoading } = useQuery({
    queryKey: ["biolinks"],
    queryFn: async () => {
      const response = await fetch("/api/biolinks");
      if (!response.ok) {
        throw new Error("Failed to fetch biolinks");
      }
      return response.json();
    },
    enabled: !!user,
  });

  const biolinks = biolinksData?.biolinks || [];

  // Create biolink mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/biolinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create biolink");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["biolinks"] });
      setShowCreateModal(false);
      setNewUsername("");
      setNewTitle("");
      setError("");
      // Redirect to editor
      if (typeof window !== "undefined") {
        window.location.href = `/editor/${data.biolink.id}`;
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Delete biolink mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/biolinks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete biolink");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biolinks"] });
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");

    if (!newUsername.trim()) {
      setError("Username is required");
      return;
    }

    // Validate username (alphanumeric and dashes only)
    if (!/^[a-zA-Z0-9-_]+$/.test(newUsername)) {
      setError(
        "Username can only contain letters, numbers, dashes, and underscores",
      );
      return;
    }

    createMutation.mutate({
      username: newUsername.toLowerCase(),
      title: newTitle || "My Biolink",
    });
  };

  const handleCopyLink = (username, id) => {
    const link = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-black dark:text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A]"
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header */}
      <header className="bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              BioLink
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </a>
            <a
              href="/account/logout"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Sign Out
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your biolinks and track your performance
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="mb-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create New Biolink
        </button>

        {/* Biolinks Grid */}
        {biolinks.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-12 text-center">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
              No biolinks yet
            </h3>
            <p className="text-[#7B7B7B] dark:text-[#A0A0A0] mb-6">
              Create your first biolink to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-semibold hover:bg-[#1a1a1a] dark:hover:bg-[#F0F0F0] transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Biolink
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {biolinks.map((biolink) => (
              <div
                key={biolink.id}
                className="bg-white dark:bg-[#1E1E1E] border border-[#E6E6E6] dark:border-[#333333] rounded-2xl p-6 hover:border-[#CFCFCF] dark:hover:border-[#505050] transition-colors"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-1">
                    {biolink.title}
                  </h3>
                  <p className="text-sm text-[#7B7B7B] dark:text-[#A0A0A0]">
                    {biolink.username}.yourdomain.com
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      biolink.published
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {biolink.published ? "Published" : "Draft"}
                  </span>
                  {biolink.custom_domain && (
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Custom Domain
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/editor/${biolink.id}`}
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#F0F0F0] transition-all text-center flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </a>
                  <a
                    href={`/${biolink.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#E6E6E6] dark:border-[#333333] rounded-lg font-medium hover:border-[#CFCFCF] dark:hover:border-[#505050] transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 text-black dark:text-white" />
                  </a>
                  <button
                    onClick={() => handleCopyLink(biolink.username, biolink.id)}
                    className="px-4 py-2 border border-[#E6E6E6] dark:border-[#333333] rounded-lg font-medium hover:border-[#CFCFCF] dark:hover:border-[#505050] transition-colors flex items-center justify-center"
                  >
                    {copiedId === biolink.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-black dark:text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this biolink?")
                      ) {
                        deleteMutation.mutate(biolink.id);
                      }
                    }}
                    className="px-4 py-2 border border-red-200 dark:border-red-900 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
              Create New Biolink
            </h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus-within:border-black dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white">
                    <span className="text-[#7B7B7B] dark:text-[#A0A0A0] mr-1">
                      yourdomain.com/
                    </span>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="username"
                      className="flex-1 bg-transparent outline-none text-black dark:text-white"
                      required
                    />
                  </div>
                  <p className="text-xs text-[#7B7B7B] dark:text-[#A0A0A0] mt-1">
                    Only letters, numbers, dashes, and underscores
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="My Biolink"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-transparent outline-none text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                    setNewUsername("");
                    setNewTitle("");
                  }}
                  className="flex-1 px-4 py-3 border border-[#E6E6E6] dark:border-[#333333] rounded-lg font-medium hover:border-[#CFCFCF] dark:hover:border-[#505050] transition-colors text-black dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#1a1a1a] dark:hover:bg-[#F0F0F0] transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
