import { useState, useEffect } from "react";
import { apiClient } from "../App";

const CharacterManager = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const realms = {
    forest: { name: "Forest", icon: "🌲", color: "bg-green-600" },
    mountain: { name: "Mountain", icon: "🏔️", color: "bg-gray-600" },
    underworld: { name: "Underworld", icon: "🔥", color: "bg-red-600" },
    galaxy: { name: "Galaxy", icon: "🌌", color: "bg-purple-600" },
    hub_village: { name: "Hub Village", icon: "🏘️", color: "bg-blue-600" }
  };

  const characterTypes = {
    hero: { name: "Hero", icon: "⭐" },
    npc: { name: "NPC", icon: "👤" },
    enemy: { name: "Enemy", icon: "👿" },
    boss: { name: "Boss", icon: "👹" }
  };

  const emotions = ["joy", "calm", "fear", "rage", "sorrow"];

  useEffect(() => {
    fetchCharacters();
  }, [selectedRealm, selectedType]);

  const fetchCharacters = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedRealm !== "all") params.append("realm", selectedRealm);
      if (selectedType !== "all") params.append("character_type", selectedType);
      
      const response = await apiClient.get(`/characters?${params}`);
      setCharacters(response.data);
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setLoading(false);
    }
  };

  const CreateCharacterModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
      realm: "forest",
      character_type: "npc",
      emotions: {},
      stats: {}
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name.trim() || !formData.description.trim()) {
        alert("Please fill in all required fields");
        return;
      }

      setCreating(true);
      try {
        await apiClient.post("/characters", formData);
        setShowCreateModal(false);
        await fetchCharacters();
        setFormData({
          name: "",
          description: "",
          realm: "forest", 
          character_type: "npc",
          emotions: {},
          stats: {}
        });
      } catch (error) {
        console.error("Error creating character:", error);
        alert("Error creating character. Please try again.");
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Create New Character</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Character name..."
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Character Type
                </label>
                <select
                  value={formData.character_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, character_type: e.target.value }))}
                  className="form-select"
                >
                  {Object.entries(characterTypes).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Character background, appearance, and role..."
                className="form-textarea"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Realm
              </label>
              <select
                value={formData.realm}
                onChange={(e) => setFormData(prev => ({ ...prev, realm: e.target.value }))}
                className="form-select"
              >
                {Object.entries(realms).map(([key, realm]) => (
                  <option key={key} value={key}>
                    {realm.icon} {realm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emotional States
              </label>
              <div className="space-y-3">
                {emotions.map((emotion) => (
                  <div key={emotion}>
                    <label className="block text-xs text-gray-400 mb-1 capitalize">
                      {emotion}
                    </label>
                    <input
                      type="text"
                      value={formData.emotions[emotion] || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emotions: { ...prev.emotions, [emotion]: e.target.value }
                      }))}
                      placeholder={`Describe ${emotion} state...`}
                      className="form-input text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="btn-primary flex items-center"
              >
                {creating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">👤</span>
                    Create Character
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-white">Characters</h1>
          <p className="text-gray-400">Manage heroes, NPCs, enemies, and bosses</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <span className="mr-2">➕</span>
          Add Character
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Filter by Realm
          </label>
          <select
            value={selectedRealm}
            onChange={(e) => setSelectedRealm(e.target.value)}
            className="form-select w-48"
          >
            <option value="all">All Realms</option>
            {Object.entries(realms).map(([key, realm]) => (
              <option key={key} value={key}>
                {realm.icon} {realm.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Filter by Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-select w-48"
          >
            <option value="all">All Types</option>
            {Object.entries(characterTypes).map(([key, type]) => (
              <option key={key} value={key}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <div key={character.id} className="glass-card rounded-lg p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {characterTypes[character.character_type]?.icon || "👤"}
                </span>
                <div>
                  <h3 className="font-bold text-white">{character.name}</h3>
                  <p className="text-sm text-gray-400">
                    {characterTypes[character.character_type]?.name}
                  </p>
                </div>
              </div>
              <span className={`${realms[character.realm]?.color} px-3 py-1 rounded-full text-white text-xs font-medium`}>
                {realms[character.realm]?.icon} {realms[character.realm]?.name}
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {character.description}
            </p>

            {/* Emotions */}
            {Object.keys(character.emotions).length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Emotions:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(character.emotions).slice(0, 3).map((emotion) => (
                    <span key={emotion} className="badge badge-purple text-xs capitalize">
                      {emotion}
                    </span>
                  ))}
                  {Object.keys(character.emotions).length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{Object.keys(character.emotions).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Created {new Date(character.created_at).toLocaleDateString()}</span>
              <button className="text-blue-400 hover:text-blue-300">
                Edit →
              </button>
            </div>
          </div>
        ))}
      </div>

      {characters.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-white mb-2">No characters yet</h3>
          <p className="text-gray-400 mb-6">Create your first character to populate the MythRealms universe</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create First Character
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && <CreateCharacterModal />}
    </div>
  );
};

export default CharacterManager;