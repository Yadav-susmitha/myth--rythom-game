import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../App";

const DocumentManager = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Document types with their templates
  const documentTypes = {
    gdd: {
      name: "Game Design Document",
      icon: "📋",
      template: {
        vision: "Game vision and core concept...",
        pillars: "Core design pillars...",
        audience: "Target audience analysis...",
        references: "Reference games and inspiration...",
        ux_flows: "User experience flows...",
        controls: "Control scheme and inputs...",
        combat: "Combat system design...",
        weapons: "Weapon systems and mechanics...",
        emotions: "Emotional design and player feelings...",
        mounts_chariots: "Mount and chariot systems...",
        puzzles: "Puzzle design (environmental, rhythm, constellation)...",
        underworld: "Underworld realm design...",
        galaxy_realm: "Galaxy realm design...",
        seasons_weather: "Dynamic weather and seasons...",
        npc_schedules: "NPC behavior and scheduling...",
        quests: "Quest system and design...",
        economy: "In-game economy and progression...",
        crafting: "Crafting and item systems...",
        audio: "Audio design and music systems...",
        art_bible: "Art style guide and standards...",
        ui_ux: "User interface design...",
        social_safety: "Social features and chat safety...",
        accessibility: "Accessibility features...",
        telemetry: "Analytics and telemetry...",
        live_ops: "Live operations and updates...",
        localization: "Localization strategy...",
        risks: "Technical and design risks...",
        roadmap: "Development roadmap and milestones..."
      }
    },
    concept_art: {
      name: "Concept Art Document",
      icon: "🎨",
      template: {
        overview: "Art direction and visual style...",
        character_designs: "Character concept descriptions...",
        environment_art: "Environment and world design...",
        props_assets: "Props and asset concepts...",
        mood_boards: "Visual mood and inspiration..."
      }
    },
    character_design: {
      name: "Character Design",
      icon: "👤",
      template: {
        character_overview: "Character background and role...",
        visual_design: "Visual appearance and design notes...",
        personality: "Personality traits and behavior...",
        abilities: "Special abilities and skills...",
        relationships: "Character relationships..."
      }
    },
    weapon_sheet: {
      name: "Weapon Sheet",
      icon: "⚔️",
      template: {
        weapon_overview: "Weapon types and categories...",
        combat_mechanics: "Combat mechanics and systems...",
        progression: "Weapon progression and upgrades...",
        balance: "Balance considerations..."
      }
    },
    music_system: {
      name: "Music System",
      icon: "🎵",
      template: {
        audio_overview: "Audio design philosophy...",
        music_tracks: "Music composition notes...",
        sound_effects: "Sound effect design...",
        implementation: "Technical implementation..."
      }
    },
    dialogue: {
      name: "Dialogue & Writing",
      icon: "💬",
      template: {
        writing_style: "Writing style and tone...",
        character_voices: "Character dialogue styles...",
        narrative_structure: "Story and narrative design...",
        localization_notes: "Localization considerations..."
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (documentId && documentId !== "new") {
      fetchDocument(documentId);
    } else if (documentId === "new") {
      setIsCreating(true);
      setCurrentDocument({
        title: "",
        document_type: "gdd",
        content: {},
        tags: []
      });
    }
  }, [documentId]);

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get("/documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocument = async (id) => {
    try {
      const response = await apiClient.get(`/documents/${id}`);
      setCurrentDocument(response.data);
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  const saveDocument = async () => {
    if (!currentDocument.title.trim()) {
      alert("Please enter a document title");
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        // Create new document
        const template = documentTypes[currentDocument.document_type]?.template || {};
        const documentData = {
          ...currentDocument,
          content: { ...template, ...currentDocument.content }
        };
        
        const response = await apiClient.post("/documents", documentData);
        setCurrentDocument(response.data);
        setIsCreating(false);
        navigate(`/documents/${response.data.id}`, { replace: true });
      } else {
        // Update existing document
        const response = await apiClient.put(`/documents/${currentDocument.id}`, currentDocument);
        setCurrentDocument(response.data);
      }
      
      await fetchDocuments(); // Refresh list
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Error saving document. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section, value) => {
    setCurrentDocument(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: value
      }
    }));
  };

  const renderDocumentList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Documents</h2>
        <button
          onClick={() => navigate("/documents/new")}
          className="btn-primary flex items-center"
        >
          <span className="mr-2">➕</span>
          New Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => navigate(`/documents/${doc.id}`)}
            className="glass-card p-6 rounded-lg cursor-pointer hover-lift"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">
                {documentTypes[doc.document_type]?.icon || "📄"}
              </div>
              <span className="badge badge-blue text-xs">
                v{doc.version}
              </span>
            </div>
            <h3 className="font-semibold text-white mb-2 line-clamp-2">
              {doc.title}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              {documentTypes[doc.document_type]?.name || "Document"}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {doc.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge badge-gray text-xs">
                  {tag}
                </span>
              ))}
              {doc.tags.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{doc.tags.length - 3} more
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Updated {new Date(doc.updated_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {documents.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-gray-400 mb-6">Create your first game design document to get started</p>
          <button
            onClick={() => navigate("/documents/new")}
            className="btn-primary"
          >
            Create First Document
          </button>
        </div>
      )}
    </div>
  );

  const renderDocumentEditor = () => {
    const template = documentTypes[currentDocument.document_type]?.template || {};
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/documents")}
            className="text-gray-400 hover:text-white flex items-center"
          >
            ← Back to Documents
          </button>
          <div className="flex items-center space-x-4">
            {!isCreating && (
              <span className="text-sm text-gray-400">
                Version {currentDocument.version} • Last saved {new Date(currentDocument.updated_at).toLocaleString()}
              </span>
            )}
            <button
              onClick={saveDocument}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Document Settings */}
        <div className="glass-card p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={currentDocument.title}
                onChange={(e) => setCurrentDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title..."
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Document Type
              </label>
              <select
                value={currentDocument.document_type}
                onChange={(e) => setCurrentDocument(prev => ({ ...prev, document_type: e.target.value }))}
                className="form-select"
              >
                {Object.entries(documentTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Content Sections</h3>
          
          {Object.entries(template).map(([section, defaultContent]) => (
            <div key={section} className="glass-card p-6 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-3 capitalize">
                {section.replace(/_/g, ' ')}
              </label>
              <textarea
                value={currentDocument.content[section] || defaultContent}
                onChange={(e) => updateContent(section, e.target.value)}
                placeholder={defaultContent}
                className="form-textarea"
                rows={6}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-800 rounded-lg skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {currentDocument ? renderDocumentEditor() : renderDocumentList()}
    </div>
  );
};

export default DocumentManager;