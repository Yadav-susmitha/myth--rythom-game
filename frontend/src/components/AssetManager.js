import { useState, useEffect } from "react";
import { apiClient } from "../App";

const AssetManager = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = {
    image: { name: "Images", icon: "🖼️", color: "bg-blue-600" },
    audio: { name: "Audio", icon: "🎵", color: "bg-purple-600" },
    document: { name: "Documents", icon: "📄", color: "bg-green-600" },
    video: { name: "Videos", icon: "🎥", color: "bg-red-600" }
  };

  useEffect(() => {
    fetchAssets();
  }, [selectedCategory]);

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      const response = await apiClient.get(`/assets?${params}`);
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const UploadModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      category: "image",
      description: "",
      tags: ""
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name.trim() || !file) {
        alert("Please fill in all required fields and select a file");
        return;
      }

      setUploading(true);
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("name", formData.name);
        uploadData.append("category", formData.category);
        uploadData.append("description", formData.description);
        uploadData.append("tags", JSON.stringify(formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)));

        await apiClient.post("/assets", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        setShowUploadModal(false);
        await fetchAssets();
        setFormData({
          name: "",
          category: "image", 
          description: "",
          tags: ""
        });
        setFile(null);
      } catch (error) {
        console.error("Error uploading asset:", error);
        alert("Error uploading asset. Please try again.");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Upload Asset</h2>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File *
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {file && (
                <p className="text-sm text-gray-400 mt-2">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asset Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mystical Forest Concept..."
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="form-select"
                >
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the asset..."
                className="form-textarea"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="concept art, forest, mystical, environment"
                className="form-input"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary flex items-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📤</span>
                    Upload Asset
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Asset Library</h1>
          <p className="text-gray-400">Manage concept art, audio, documents, and media</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center"
        >
          <span className="mr-2">📤</span>
          Upload Asset
        </button>
      </div>

      {/* Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-select w-48"
        >
          <option value="all">All Categories</option>
          {Object.entries(categories).map(([key, category]) => (
            <option key={key} value={key}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="glass-card rounded-lg p-4 hover-lift">
            <div className="aspect-square bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {asset.category === "image" && asset.file_path ? (
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}/${asset.file_path}`}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="text-4xl text-gray-600" style={asset.category === "image" ? {display: 'none'} : {}}>
                {categories[asset.category]?.icon || "📄"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm line-clamp-1">
                  {asset.name}
                </h3>
                <span className={`${categories[asset.category]?.color} px-2 py-1 rounded text-white text-xs`}>
                  {categories[asset.category]?.icon}
                </span>
              </div>

              {asset.description && (
                <p className="text-gray-300 text-xs line-clamp-2">
                  {asset.description}
                </p>
              )}

              {asset.tags && asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {asset.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="badge badge-gray text-xs">
                      {tag}
                    </span>
                  ))}
                  {asset.tags.length > 2 && (
                    <span className="text-gray-500 text-xs">
                      +{asset.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-700">
                <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                <button className="text-blue-400 hover:text-blue-300">
                  View →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-white mb-2">No assets yet</h3>
          <p className="text-gray-400 mb-6">Upload your first concept art, audio, or document</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            Upload First Asset
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default AssetManager;