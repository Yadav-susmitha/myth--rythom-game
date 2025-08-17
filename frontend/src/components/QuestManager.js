import { useState, useEffect } from "react";
import { apiClient } from "../App";

const QuestManager = () => {
  const [quests, setQuests] = useState([]);
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

  const questTypes = {
    main: { name: "Main Quest", icon: "⭐", color: "bg-yellow-600" },
    side: { name: "Side Quest", icon: "📋", color: "bg-blue-600" },
    puzzle: { name: "Puzzle Quest", icon: "🧩", color: "bg-purple-600" },
    combat: { name: "Combat Quest", icon: "⚔️", color: "bg-red-600" }
  };

  useEffect(() => {
    fetchQuests();
  }, [selectedRealm, selectedType]);

  const fetchQuests = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedRealm !== "all") params.append("realm", selectedRealm);
      if (selectedType !== "all") params.append("quest_type", selectedType);
      
      const response = await apiClient.get(`/quests?${params}`);
      setQuests(response.data);
    } catch (error) {
      console.error("Error fetching quests:", error);
    } finally {
      setLoading(false);
    }
  };

  const CreateQuestModal = () => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      realm: "forest",
      quest_type: "side",
      objectives: [""]
    });
    const [creating, setCreating] = useState(false);

    const addObjective = () => {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, ""]
      }));
    };

    const updateObjective = (index, value) => {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
      }));
    };

    const removeObjective = (index) => {
      setFormData(prev => ({
        ...prev,
        objectives: prev.objectives.filter((_, i) => i !== index)
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.title.trim() || !formData.description.trim()) {
        alert("Please fill in all required fields");
        return;
      }

      const questData = {
        ...formData,
        objectives: formData.objectives.filter(obj => obj.trim())
      };

      setCreating(true);
      try {
        await apiClient.post("/quests", questData);
        setShowCreateModal(false);
        await fetchQuests();
        setFormData({
          title: "",
          description: "",
          realm: "forest",
          quest_type: "side",
          objectives: [""]
        });
      } catch (error) {
        console.error("Error creating quest:", error);
        alert("Error creating quest. Please try again.");
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Create New Quest</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quest Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="The Sacred Grove Mystery..."
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Quest Type
                </label>
                <select
                  value={formData.quest_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, quest_type: e.target.value }))}
                  className="form-select"
                >
                  {Object.entries(questTypes).map(([key, type]) => (
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
                placeholder="A mysterious disturbance has been detected in the sacred grove..."
                className="form-textarea"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Objectives
              </label>
              <div className="space-y-3">
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder={`Objective ${index + 1}...`}
                      className="form-input flex-1"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addObjective}
                  className="btn-secondary text-sm"
                >
                  + Add Objective
                </button>
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
                    <span className="mr-2">📋</span>
                    Create Quest
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
          <h1 className="text-3xl font-bold text-white">Quest System</h1>
          <p className="text-gray-400">Design adventures and objectives for players</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <span className="mr-2">➕</span>
          Create Quest
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
            {Object.entries(questTypes).map(([key, type]) => (
              <option key={key} value={key}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map((quest) => (
          <div key={quest.id} className="glass-card rounded-lg p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {questTypes[quest.quest_type]?.icon || "📋"}
                </span>
                <div>
                  <h3 className="font-bold text-white">{quest.title}</h3>
                  <p className="text-sm text-gray-400">
                    {questTypes[quest.quest_type]?.name}
                  </p>
                </div>
              </div>
              <span className={`${realms[quest.realm]?.color} px-2 py-1 rounded-full text-white text-xs font-medium`}>
                {realms[quest.realm]?.icon}
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {quest.description}
            </p>

            {/* Objectives */}
            {quest.objectives && quest.objectives.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Objectives ({quest.objectives.length}):</p>
                <div className="space-y-1">
                  {quest.objectives.slice(0, 2).map((objective, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-300">
                      <span className="mr-2 text-green-400">✓</span>
                      <span className="line-clamp-1">{objective}</span>
                    </div>
                  ))}
                  {quest.objectives.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{quest.objectives.length - 2} more objectives
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Created {new Date(quest.created_at).toLocaleDateString()}</span>
              <button className="text-blue-400 hover:text-blue-300">
                Edit →
              </button>
            </div>
          </div>
        ))}
      </div>

      {quests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No quests yet</h3>
          <p className="text-gray-400 mb-6">Create your first quest to begin the adventure system</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create First Quest
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && <CreateQuestModal />}
    </div>
  );
};

export default QuestManager;