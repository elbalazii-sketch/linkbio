import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Palette,
  BarChart3,
  Upload,
  Edit2,
  X,
  Image as ImageIcon,
  Link2,
  Settings,
  Sparkles,
} from "lucide-react";

export default function EditorPage({ params }) {
  const { id } = params;
  const { data: user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const { upload, uploading } = useUpload();

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [published, setPublished] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState({
    background: "#FFFFFF",
    buttonColor: "#000000",
    buttonTextColor: "#FFFFFF",
    textColor: "#000000",
    fontFamily: "Inter",
  });

  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [editingLink, setEditingLink] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch biolink data
  const { data, isLoading } = useQuery({
    queryKey: ["biolink", id],
    queryFn: async () => {
      const response = await fetch(`/api/biolinks/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch biolink");
      }
      return response.json();
    },
    enabled: !!user && !!id,
  });

  const biolink = data?.biolink;
  const links = data?.links || [];

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["analytics", id],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return response.json();
    },
    enabled: !!user && !!id,
  });

  const analytics = analyticsData?.analytics || { views: 0, clicks: 0 };

  // Set initial values when data loads
  useEffect(() => {
    if (biolink) {
      setTitle(biolink.title || "");
      setBio(biolink.bio || "");
      setPublished(biolink.published ?? true);
      setAvatarUrl(biolink.avatar_url || "");
      if (biolink.theme) {
        setTheme(biolink.theme);
      }
    }
  }, [biolink]);

  // Update biolink mutation
  const updateBiolinkMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await fetch(`/api/biolinks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update biolink");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biolink", id] });
    },
  });

  // Add link mutation
  const addLinkMutation = useMutation({
    mutationFn: async (linkData) => {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });
      if (!response.ok) {
        throw new Error("Failed to add link");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biolink", id] });
      setShowAddLink(false);
      setNewLinkTitle("");
      setNewLinkUrl("");
    },
  });

  // Update link mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({ linkId, updates }) => {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update link");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biolink", id] });
      setEditingLink(null);
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId) => {
      const response = await fetch(`/api/links/${linkId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete link");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biolink", id] });
    },
  });

  // Reorder links mutation
  const reorderMutation = useMutation({
    mutationFn: async (linkOrders) => {
      const response = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ biolink_id: id, link_orders: linkOrders }),
      });
      if (!response.ok) {
        throw new Error("Failed to reorder links");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biolink", id] });
    },
  });

  const handleSave = () => {
    updateBiolinkMutation.mutate({
      title,
      bio,
      theme,
      published,
      avatar_url: avatarUrl,
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload({ file });
      if (result.error) {
        throw new Error(result.error);
      }
      const url = result.url;
      setAvatarUrl(url);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      alert("Failed to upload avatar");
    }
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      addLinkMutation.mutate({
        biolink_id: id,
        title: newLinkTitle,
        url: newLinkUrl,
      });
    }
  };

  const handleUpdateLink = (e) => {
    e.preventDefault();
    if (editingLink && editingLink.title.trim() && editingLink.url.trim()) {
      updateLinkMutation.mutate({
        linkId: editingLink.id,
        updates: {
          title: editingLink.title,
          url: editingLink.url,
        },
      });
    }
  };

  const handleToggleVisibility = (link) => {
    updateLinkMutation.mutate({
      linkId: link.id,
      updates: { visible: !link.visible },
    });
  };

  const handleDeleteLink = (linkId) => {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteLinkMutation.mutate(linkId);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLinks = [...links];
    const draggedLink = newLinks[draggedIndex];
    newLinks.splice(draggedIndex, 1);
    newLinks.splice(index, 0, draggedLink);

    setDraggedIndex(index);

    // Update positions
    const linkOrders = newLinks.map((link, idx) => ({
      id: link.id,
      position: idx,
    }));

    reorderMutation.mutate(linkOrders);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const applyThemePreset = (preset) => {
    const presets = {
      default: {
        background: "#FFFFFF",
        buttonColor: "#000000",
        buttonTextColor: "#FFFFFF",
        textColor: "#000000",
        fontFamily: "Inter",
      },
      ocean: {
        background: "#0A1929",
        buttonColor: "#3B82F6",
        buttonTextColor: "#FFFFFF",
        textColor: "#FFFFFF",
        fontFamily: "Inter",
      },
      sunset: {
        background: "#FFF5F5",
        buttonColor: "#F59E0B",
        buttonTextColor: "#FFFFFF",
        textColor: "#1F2937",
        fontFamily: "Inter",
      },
      forest: {
        background: "#F0FDF4",
        buttonColor: "#059669",
        buttonTextColor: "#FFFFFF",
        textColor: "#064E3B",
        fontFamily: "Inter",
      },
      purple: {
        background: "#F5F3FF",
        buttonColor: "#7C3AED",
        buttonTextColor: "#FFFFFF",
        textColor: "#4C1D95",
        fontFamily: "Inter",
      },
    };

    setTheme(presets[preset]);
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !biolink) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-600" />/{biolink.username}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {published ? "✅ Published" : "📝 Draft"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/${biolink.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
              >
                👁️ View Live
              </a>
              <button
                onClick={handleSave}
                disabled={updateBiolinkMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl"
              >
                <Save className="w-4 h-4" />
                {updateBiolinkMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-xl p-2 flex gap-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                👤 Profile
              </button>
              <button
                onClick={() => setActiveTab("theme")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "theme"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                🎨 Theme
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "analytics"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                📊 Analytics
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <>
                {/* Profile Settings */}
                <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Profile Information
                  </h3>
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                            {title.charAt(0) || "?"}
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-all flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            {uploading ? "Uploading..." : "Upload Photo"}
                          </div>
                        </label>
                        {avatarUrl && (
                          <button
                            onClick={() => setAvatarUrl("")}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg font-medium transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Your Name"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Tell people about yourself..."
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      />
                    </div>

                    {/* Published Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white block">
                          Publish Biolink
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Make your biolink visible to everyone
                        </span>
                      </div>
                      <button
                        onClick={() => setPublished(!published)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          published
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`absolute w-6 h-6 bg-white rounded-full top-0.5 transition-transform shadow-md ${
                            published ? "translate-x-7" : "translate-x-0.5"
                          }`}
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Links Section */}
                <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Your Links
                    </h3>
                    <button
                      onClick={() => setShowAddLink(!showAddLink)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </button>
                  </div>

                  {/* Add Link Form */}
                  {showAddLink && (
                    <form
                      onSubmit={handleAddLink}
                      className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-900"
                    >
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Link title (e.g., My YouTube Channel)"
                          value={newLinkTitle}
                          onChange={(e) => setNewLinkTitle(e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddLink(false);
                              setNewLinkTitle("");
                              setNewLinkUrl("");
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addLinkMutation.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                          >
                            {addLinkMutation.isPending
                              ? "Adding..."
                              : "Add Link"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Edit Link Modal */}
                  {editingLink && (
                    <form
                      onSubmit={handleUpdateLink}
                      className="mb-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-xl border border-purple-200 dark:border-purple-900"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Edit Link
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingLink(null)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Link title"
                          value={editingLink.title}
                          onChange={(e) =>
                            setEditingLink({
                              ...editingLink,
                              title: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={editingLink.url}
                          onChange={(e) =>
                            setEditingLink({
                              ...editingLink,
                              url: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLink(null)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={updateLinkMutation.isPending}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                          >
                            {updateLinkMutation.isPending
                              ? "Updating..."
                              : "Update Link"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Links List */}
                  <div className="space-y-3">
                    {links.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No links yet</p>
                        <p className="text-sm">
                          Add your first link to get started!
                        </p>
                      </div>
                    ) : (
                      links.map((link, index) => (
                        <div
                          key={link.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all cursor-move ${
                            !link.visible ? "opacity-50" : ""
                          }`}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {link.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {link.url}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingLink(link)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleToggleVisibility(link)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title={link.visible ? "Hide" : "Show"}
                            >
                              {link.visible ? (
                                <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Theme Tab */}
            {activeTab === "theme" && (
              <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  Customize Theme
                </h3>

                {/* Theme Presets */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        name: "Default",
                        key: "default",
                        colors: ["#FFFFFF", "#000000"],
                      },
                      {
                        name: "Ocean",
                        key: "ocean",
                        colors: ["#0A1929", "#3B82F6"],
                      },
                      {
                        name: "Sunset",
                        key: "sunset",
                        colors: ["#FFF5F5", "#F59E0B"],
                      },
                      {
                        name: "Forest",
                        key: "forest",
                        colors: ["#F0FDF4", "#059669"],
                      },
                      {
                        name: "Purple",
                        key: "purple",
                        colors: ["#F5F3FF", "#7C3AED"],
                      },
                    ].map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() => applyThemePreset(preset.key)}
                        className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-all text-center group"
                      >
                        <div className="flex gap-1 mb-2 justify-center">
                          {preset.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Custom Colors
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.background}
                          onChange={(e) =>
                            setTheme({ ...theme, background: e.target.value })
                          }
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.background}
                          onChange={(e) =>
                            setTheme({ ...theme, background: e.target.value })
                          }
                          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.textColor}
                          onChange={(e) =>
                            setTheme({ ...theme, textColor: e.target.value })
                          }
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.textColor}
                          onChange={(e) =>
                            setTheme({ ...theme, textColor: e.target.value })
                          }
                          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Button Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.buttonColor}
                          onChange={(e) =>
                            setTheme({ ...theme, buttonColor: e.target.value })
                          }
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.buttonColor}
                          onChange={(e) =>
                            setTheme({ ...theme, buttonColor: e.target.value })
                          }
                          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Button Text
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.buttonTextColor}
                          onChange={(e) =>
                            setTheme({
                              ...theme,
                              buttonTextColor: e.target.value,
                            })
                          }
                          className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={theme.buttonTextColor}
                          onChange={(e) =>
                            setTheme({
                              ...theme,
                              buttonTextColor: e.target.value,
                            })
                          }
                          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Analytics Overview
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {analytics.views || 0}
                    </div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Total Views
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {analytics.clicks || 0}
                    </div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Total Clicks
                    </div>
                  </div>
                </div>

                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">More analytics coming soon!</p>
                  <p className="text-sm">
                    Track detailed metrics of your biolink
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-full overflow-auto shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Live Preview
              </h3>

              {/* Preview Content */}
              <div className="mx-auto max-w-md">
                <div
                  className="min-h-[600px] rounded-2xl p-8 flex flex-col items-center shadow-2xl"
                  style={{
                    backgroundColor: theme.background,
                    color: theme.textColor,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover mb-6 shadow-lg"
                      style={{
                        border: `4px solid ${theme.buttonColor}`,
                      }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full mb-6 flex items-center justify-center text-3xl font-bold shadow-lg"
                      style={{
                        backgroundColor: theme.buttonColor,
                        color: theme.buttonTextColor,
                      }}
                    >
                      {title.charAt(0) || "?"}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-2 text-center">
                    {title || "Your Title"}
                  </h2>

                  {/* Bio */}
                  {bio && (
                    <p className="text-center mb-8 opacity-90 px-4">{bio}</p>
                  )}

                  {/* Links */}
                  <div className="w-full space-y-3">
                    {links
                      .filter((link) => link.visible)
                      .map((link) => (
                        <div
                          key={link.id}
                          className="w-full px-6 py-4 rounded-full font-semibold text-center transition-transform hover:scale-105 cursor-pointer shadow-md"
                          style={{
                            backgroundColor: theme.buttonColor,
                            color: theme.buttonTextColor,
                          }}
                        >
                          {link.title}
                        </div>
                      ))}
                    {links.filter((link) => link.visible).length === 0 && (
                      <p className="text-center opacity-50 py-8">
                        Your links will appear here
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
