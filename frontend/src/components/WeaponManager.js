import { useState, useEffect } from "react";
import { apiClient } from "../App";

const WeaponManager = () => {
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState("all");

  const weaponTypes = {
    sword: { name: "Sword", icon: "🗡️" },
    spear: { name: "Spear", icon: "🔱" },
    bow: { name: "Bow", icon: "🏹" },
    chakram: { name: "Chakram", icon: "🌀" },
    staff: { name: "Staff", icon: "🔮" },
    greatsword: { name: "Greatsword", icon: "⚔️" }
  };

  useEffect(() => {
    fetchWeapons();
  }, [selectedType]);

  const fetchWeapons = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("weapon_type", selectedType);
      
      const response = await apiClient.get(`/weapons?${params}`);
      setWeapons(response.data);
    } catch (error) {
      console.error("Error fetching weapons:", error);
    } finally {
      setLoading(false);
    }
  };

  const CreateWeaponModal = () => {
    const [formData, setFormData] = useState({
      name: "",
      weapon_type: "sword",
      lore: "",
      damage_profile: { physical: 50, spirit: 30 },
      combo_path: ["light", "heavy", "ability"]
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name.trim() || !formData.lore.trim()) {
        alert("Please fill in all required fields");
        return;
      }

      setCreating(true);
      try {
        await apiClient.post("/weapons", formData);
        setShowCreateModal(false);
        await fetchWeapons();
        setFormData({
          name: "",
          weapon_type: "sword",
          lore: "",
          damage_profile: { physical: 50, spirit: 30 },
          combo_path: ["light", "heavy", "ability"]
        });
      } catch (error) {
        console.error("Error creating weapon:", error);
        alert("Error creating weapon. Please try again.");
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Create New Weapon</h2>
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
                  Weapon Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Excalibur, Shadowbane, etc..."
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weapon Type
                </label>
                <select
                  value={formData.weapon_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, weapon_type: e.target.value }))}
                  className="form-select"
                >
                  {Object.entries(weaponTypes).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lore & Description *
              </label>
              <textarea
                value={formData.lore}
                onChange={(e) => setFormData(prev => ({ ...prev, lore: e.target.value }))}
                placeholder="The legendary blade forged in the fires of..."
                className="form-textarea"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Damage Profile
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Physical Damage
                  </label>
                  <input
                    type="number"
                    value={formData.damage_profile.physical}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      damage_profile: { ...prev.damage_profile, physical: parseInt(e.target.value) }
                    }))}
                    min="0"
                    max="200"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Spirit Damage
                  </label>
                  <input
                    type="number"
                    value={formData.damage_profile.spirit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      damage_profile: { ...prev.damage_profile, spirit: parseInt(e.target.value) }
                    }))}
                    min="0"
                    max="200"
                    className="form-input"
                  />
                </div>
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
                    <span className="mr-2">⚔️</span>
                    Create Weapon
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
          <h1 className="text-3xl font-bold text-white">Weapons Arsenal</h1>
          <p className="text-gray-400">Design and manage legendary weapons</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <span className="mr-2">➕</span>
          Create Weapon
        </button>
      </div>

      {/* Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Filter by Type
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="form-select w-48"
        >
          <option value="all">All Weapon Types</option>
          {Object.entries(weaponTypes).map(([key, type]) => (
            <option key={key} value={key}>
              {type.icon} {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Weapons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weapons.map((weapon) => (
          <div key={weapon.id} className="glass-card rounded-lg p-6 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">
                  {weaponTypes[weapon.weapon_type]?.icon || "⚔️"}
                </span>
                <div>
                  <h3 className="font-bold text-white text-lg">{weapon.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">
                    {weaponTypes[weapon.weapon_type]?.name}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {weapon.lore}
            </p>

            {/* Damage Stats */}
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <h4 className="text-xs font-medium text-gray-400 mb-2">Damage Profile</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">
                    {weapon.damage_profile?.physical || 0}
                  </div>
                  <div className="text-xs text-gray-400">Physical</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {weapon.damage_profile?.spirit || 0}
                  </div>
                  <div className="text-xs text-gray-400">Spirit</div>
                </div>
              </div>
            </div>

            {/* Combo Path */}
            {weapon.combo_path && weapon.combo_path.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-400 mb-2">Combo Path</h4>
                <div className="flex gap-1">
                  {weapon.combo_path.map((move, index) => (
                    <span key={index} className="badge badge-purple text-xs capitalize">
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Created {new Date(weapon.created_at).toLocaleDateString()}</span>
              <button className="text-blue-400 hover:text-blue-300">
                Edit →
              </button>
            </div>
          </div>
        ))}
      </div>

      {weapons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No weapons yet</h3>
          <p className="text-gray-400 mb-6">Create your first legendary weapon for the MythRealms arsenal</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Forge First Weapon
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && <CreateWeaponModal />}
    </div>
  );
};

export default WeaponManager;