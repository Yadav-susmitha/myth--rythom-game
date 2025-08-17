import { useState, useEffect } from "react";
import { apiClient } from "../App";

const MusicManager = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRealm, setSelectedRealm] = useState("all");
  const [selectedMood, setSelectedMood] = useState("all");

  const realms = {
    forest: { name: "Forest", icon: "🌲", color: "bg-green-600" },
    mountain: { name: "Mountain", icon: "🏔️", color: "bg-gray-600" },
    underworld: { name: "Underworld", icon: "🔥", color: "bg-red-600" },
    galaxy: { name: "Galaxy", icon: "🌌", color: "bg-purple-600" },
    hub_village: { name: "Hub Village", icon: "🏘️", color: "bg-blue-600" }
  };

  const moods = {
    exploration: { name: "Exploration", icon: "🚶" },
    combat: { name: "Combat", icon: "⚔️" },
    meditation: { name: "Meditation", icon: "🧘" },
    stealth: { name: "Stealth", icon: "🤫" },
    boss_fight: { name: "Boss Fight", icon: "👹" },
    ambient: { name: "Ambient", icon: "🌙" }
  };

  const musicKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const instruments = [
    "Strings", "Brass", "Woodwinds", "Percussion", "Piano", "Harp", 
    "Choir", "Synthesizer", "Ethnic Instruments", "Ambient Pads"
  ];

  useEffect(() => {
    fetchTracks();
  }, [selectedRealm, selectedMood]);

  const fetchTracks = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedRealm !== "all") params.append("realm", selectedRealm);
      if (selectedMood !== "all") params.append("mood", selectedMood);
      
      const response = await apiClient.get(`/music?${params}`);
      setTracks(response.data);
    } catch (error) {
      console.error("Error fetching music tracks:", error);
    } finally {
      setLoading(false);
    }
  };

  const CreateTrackModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      realm: "forest",
      mood: "exploration",
      tempo: 120,
      key: "C",
      instrumentation: []
    });
    const [creating, setCreating] = useState(false);

    const toggleInstrument = (instrument) => {
      setFormData(prev => ({
        ...prev,
        instrumentation: prev.instrumentation.includes(instrument)
          ? prev.instrumentation.filter(i => i !== instrument)
          : [...prev.instrumentation, instrument]
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name.trim()) {
        alert("Please enter a track name");
        return;
      }

      setCreating(true);
      try {
        await apiClient.post("/music", formData);
        setShowCreateModal(false);
        await fetchTracks();
        setFormData({
          name: "",
          realm: "forest",
          mood: "exploration",
          tempo: 120,
          key: "C",
          instrumentation: []
        });
      } catch (error) {
        console.error("Error creating music track:", error);
        alert("Error creating music track. Please try again.");
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Create Music Track</h2>
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
                Track Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Whispers of the Ancient Grove..."
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
                  Mood
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                  className="form-select"
                >
                  {Object.entries(moods).map(([key, mood]) => (
                    <option key={key} value={key}>
                      {mood.icon} {mood.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  value={formData.tempo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                  min="60"
                  max="200"
                  className="form-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Musical Key
                </label>
                <select
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  className="form-select"
                >
                  {musicKeys.map((key) => (
                    <option key={key} value={key}>
                      {key} Major
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instrumentation
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {instruments.map((instrument) => (
                  <label key={instrument} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.instrumentation.includes(instrument)}
                      onChange={() => toggleInstrument(instrument)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-300">{instrument}</span>
                  </label>
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
                    <span className="mr-2">🎵</span>
                    Create Track
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
          <h1 className="text-3xl font-bold text-white">Music System</h1>
          <p className="text-gray-400">Compose adaptive music for each realm and mood</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <span className="mr-2">➕</span>
          Compose Track
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
            Filter by Mood
          </label>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="form-select w-48"
          >
            <option value="all">All Moods</option>
            {Object.entries(moods).map(([key, mood]) => (
              <option key={key} value={key}>
                {mood.icon} {mood.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <div key={track.id} className="glass-card rounded-lg p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🎵</span>
                <div>
                  <h3 className="font-bold text-white">{track.name}</h3>
                  <p className="text-sm text-gray-400">
                    {moods[track.mood]?.name} • {track.key} Major
                  </p>
                </div>
              </div>
              <span className={`${realms[track.realm]?.color} px-2 py-1 rounded-full text-white text-xs font-medium`}>
                {realms[track.realm]?.icon}
              </span>
            </div>

            {/* Music Details */}
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-400">{track.tempo}</div>
                  <div className="text-xs text-gray-400">BPM</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">{track.key}</div>
                  <div className="text-xs text-gray-400">Key</div>
                </div>
              </div>
            </div>

            {/* Instrumentation */}
            {track.instrumentation && track.instrumentation.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Instruments:</p>
                <div className="flex flex-wrap gap-1">
                  {track.instrumentation.slice(0, 3).map((instrument) => (
                    <span key={instrument} className="badge badge-blue text-xs">
                      {instrument}
                    </span>
                  ))}
                  {track.instrumentation.length > 3 && (
                    <span className="text-gray-500 text-xs">
                      +{track.instrumentation.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Created {new Date(track.created_at).toLocaleDateString()}</span>
              <button className="text-blue-400 hover:text-blue-300">
                Edit →
              </button>
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎼</div>
          <h3 className="text-xl font-semibold text-white mb-2">No music tracks yet</h3>
          <p className="text-gray-400 mb-6">Compose your first track to bring MythRealms to life</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Compose First Track
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && <CreateTrackModal />}
    </div>
  );
};

export default MusicManager;