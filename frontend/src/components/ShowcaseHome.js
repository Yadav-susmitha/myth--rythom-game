import { useState, useEffect } from "react";
import { apiClient } from "../App";

const ShowcaseHome = () => {
  const [stats, setStats] = useState(null);
  const [featuredContent, setFeaturedContent] = useState({
    characters: [],
    weapons: [],
    quests: []
  });
  const [activeRealm, setActiveRealm] = useState("forest");

  const realms = {
    forest: {
      name: "Mystical Forest",
      icon: "🌲",
      description: "Ancient woods filled with bioluminescent fungi and sacred shrines. Home to forest spirits and the first trials of the hero's journey.",
      color: "from-green-800 to-emerald-900",
      features: ["Bioluminescent Flora", "Sacred Shrines", "Puzzle Mirrors", "Forest Spirits"]
    },
    mountain: {
      name: "Snow-Capped Peaks", 
      icon: "🏔️",
      description: "Treacherous mountain paths adorned with prayer flags. Test your climbing skills and master the ancient chariot trials.",
      color: "from-slate-700 to-gray-800", 
      features: ["Prayer Flag Paths", "Climbing Challenges", "Chariot Trials", "Mountain Temples"]
    },
    underworld: {
      name: "Demon's Underworld",
      icon: "🔥", 
      description: "A realm of basalt pillars and glowing veins where demonic creatures dwell. Face the Echo-Maw and other fearsome bosses.",
      color: "from-red-900 to-orange-900",
      features: ["Basalt Chambers", "Demon Nests", "Boss Battles", "Glowing Veins"]
    },
    galaxy: {
      name: "Celestial Galaxy",
      icon: "🌌",
      description: "Floating platforms among starfields where constellation bridges connect spiritual arenas. The ultimate test of enlightenment.", 
      color: "from-purple-900 to-indigo-900",
      features: ["Floating Platforms", "Constellation Bridges", "Spiritual Arenas", "Aurora Veils"]
    },
    hub_village: {
      name: "Village Hub",
      icon: "🏘️", 
      description: "The peaceful starting point of your journey. Interact with NPCs, craft equipment, and prepare for adventures ahead.",
      color: "from-blue-800 to-cyan-900",
      features: ["NPC Interactions", "Crafting Stations", "Quest Givers", "Safe Haven"]
    }
  };

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const [statsRes, charactersRes, weaponsRes, questsRes] = await Promise.all([
          apiClient.get("/dashboard/stats"),
          apiClient.get("/characters?limit=6"),
          apiClient.get("/weapons?limit=6"), 
          apiClient.get("/quests?limit=6")
        ]);

        setStats(statsRes.data);
        setFeaturedContent({
          characters: charactersRes.data,
          weapons: weaponsRes.data,
          quests: questsRes.data
        });
      } catch (error) {
        console.error("Error fetching showcase data:", error);
      }
    };

    fetchShowcaseData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              <span className="gradient-text-gold">MythRealms</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Embark on a mystical journey through enchanted realms, master ancient weapons, and discover the power within.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 pulse-glow">
                🚀 Explore Realms
              </button>
              <button className="px-8 py-4 bg-gray-800 bg-opacity-80 text-white font-bold rounded-lg hover:bg-opacity-100 transition-all">
                📖 Read GDD
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 animate-pulse">
          <div className="text-6xl opacity-30">⭐</div>
        </div>
        <div className="absolute bottom-32 right-32 animate-pulse animation-delay-1000">
          <div className="text-4xl opacity-30">🌙</div>
        </div>
        <div className="absolute top-1/3 right-20 animate-pulse animation-delay-2000">
          <div className="text-5xl opacity-30">✨</div>
        </div>
      </section>

      {/* Stats Overview */}
      {stats && (
        <section className="py-16 bg-gray-900">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-white mb-12">
              Universe by the Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: "Realms", value: 5, icon: "🌍" },
                { label: "Characters", value: stats.characters, icon: "👥" },
                { label: "Weapons", value: stats.weapons, icon: "⚔️" },
                { label: "Quests", value: stats.quests, icon: "📋" },
                { label: "Music Tracks", value: stats.music_tracks, icon: "🎵" },
                { label: "Assets", value: stats.assets, icon: "🖼️" }
              ].map((stat, index) => (
                <div key={index} className="text-center glass-card p-6 rounded-lg hover-lift">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Realms Explorer */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Explore the Realms
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Each realm offers unique challenges, breathtaking environments, and legendary encounters.
          </p>

          {/* Realm Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {Object.entries(realms).map(([key, realm]) => (
              <button
                key={key}
                onClick={() => setActiveRealm(key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeRealm === key
                    ? "bg-white text-gray-900"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {realm.icon} {realm.name}
              </button>
            ))}
          </div>

          {/* Active Realm Display */}
          <div className={`rounded-2xl p-8 bg-gradient-to-br ${realms[activeRealm].color} fade-in-up`}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {realms[activeRealm].icon} {realms[activeRealm].name}
                </h3>
                <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                  {realms[activeRealm].description}
                </p>
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {realms[activeRealm].features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-200">
                        <span className="mr-2">✨</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-black bg-opacity-20 rounded-lg p-8 text-center">
                <div className="text-8xl mb-4">{realms[activeRealm].icon}</div>
                <p className="text-gray-300 italic">
                  "Concept art and screenshots will showcase the mystical beauty of each realm"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Featured Universe Content
          </h2>

          <div className="space-y-16">
            {/* Featured Characters */}
            {featuredContent.characters.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                  <span className="mr-3">👥</span>
                  Legendary Characters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredContent.characters.slice(0, 6).map((character) => (
                    <div key={character.id} className="glass-card p-6 rounded-lg hover-lift">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">
                          {character.character_type === "hero" ? "⭐" :
                           character.character_type === "boss" ? "👹" :
                           character.character_type === "enemy" ? "👿" : "👤"}
                        </span>
                        <div>
                          <h4 className="font-bold text-white">{character.name}</h4>
                          <p className="text-sm text-gray-400 capitalize">{character.character_type}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {character.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Weapons */}
            {featuredContent.weapons.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                  <span className="mr-3">⚔️</span>
                  Legendary Arsenal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredContent.weapons.slice(0, 6).map((weapon) => (
                    <div key={weapon.id} className="glass-card p-6 rounded-lg hover-lift">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">
                          {weapon.weapon_type === "sword" ? "🗡️" :
                           weapon.weapon_type === "bow" ? "🏹" :
                           weapon.weapon_type === "staff" ? "🔮" : "⚔️"}
                        </span>
                        <div>
                          <h4 className="font-bold text-white">{weapon.name}</h4>
                          <p className="text-sm text-gray-400 capitalize">{weapon.weapon_type}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {weapon.lore}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Shape the MythRealms Universe?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Dive into the content management system and help build the rich, detailed world of MythRealms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              📄 Manage Content
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              📖 Read Full GDD
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShowcaseHome;