import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../App";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, documentsResponse, charactersResponse] = await Promise.all([
          apiClient.get("/dashboard/stats"),
          apiClient.get("/documents?limit=5"),
          apiClient.get("/characters?limit=5"),
        ]);

        setStats(statsResponse.data);
        
        // Combine recent activity
        const activity = [
          ...documentsResponse.data.map(doc => ({ 
            type: "document", 
            item: doc, 
            action: "updated",
            time: new Date(doc.updated_at)
          })),
          ...charactersResponse.data.map(char => ({ 
            type: "character", 
            item: char, 
            action: "created",
            time: new Date(char.created_at)
          }))
        ].sort((a, b) => b.time - a.time).slice(0, 10);

        setRecentActivity(activity);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      title: "Documents", 
      value: stats?.documents || 0, 
      icon: "📄", 
      color: "bg-blue-600",
      link: "/documents"
    },
    { 
      title: "Characters", 
      value: stats?.characters || 0, 
      icon: "👤", 
      color: "bg-green-600",
      link: "/characters"
    },
    { 
      title: "Weapons", 
      value: stats?.weapons || 0, 
      icon: "⚔️", 
      color: "bg-red-600",
      link: "/weapons"
    },
    { 
      title: "Quests", 
      value: stats?.quests || 0, 
      icon: "📋", 
      color: "bg-purple-600",
      link: "/quests"
    },
    { 
      title: "Music Tracks", 
      value: stats?.music_tracks || 0, 
      icon: "🎵", 
      color: "bg-yellow-600",
      link: "/music"
    },
    { 
      title: "Assets", 
      value: stats?.assets || 0, 
      icon: "🖼️", 
      color: "bg-indigo-600",
      link: "/assets"
    },
  ];

  const quickActions = [
    { 
      title: "Create New Document", 
      description: "Start a new GDD section or document",
      icon: "➕",
      link: "/documents",
      color: "bg-blue-600"
    },
    { 
      title: "Add Character", 
      description: "Create heroes, NPCs, or enemies",
      icon: "👥",
      link: "/characters", 
      color: "bg-green-600"
    },
    { 
      title: "Design Weapon", 
      description: "Create new weapons with stats",
      icon: "🗡️",
      link: "/weapons",
      color: "bg-red-600"
    },
    { 
      title: "Upload Assets", 
      description: "Add concept art, audio, or documents",
      icon: "📤",
      link: "/assets",
      color: "bg-purple-600"
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="fade-in-up">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to <span className="gradient-text">MythRealms</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Game Design Document & Content Management Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up">
        {statCards.map((card) => (
          <Link 
            key={card.title}
            to={card.link}
            className="glass-card rounded-xl p-6 hover-lift group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-4 rounded-lg text-2xl group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6 fade-in-up">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="flex items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
              >
                <div className={`${action.color} p-3 rounded-lg mr-4 text-xl group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-medium text-white">{action.title}</h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
                <div className="ml-auto text-gray-400 group-hover:text-white transition-colors">
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-6 fade-in-up">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-800 rounded-lg">
                  <div className="mr-3 text-lg">
                    {activity.type === "document" ? "📄" : 
                     activity.type === "character" ? "👤" : "📋"}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {activity.type === "document" ? activity.item.title : activity.item.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {activity.action} • {activity.time.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-gray-400">No activity yet</p>
                <p className="text-gray-500 text-sm">Start creating content to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MythRealms Preview */}
      <div className="glass-card rounded-xl p-8 fade-in-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold gradient-text-gold mb-4">
            ⭐ Explore MythRealms Universe ⭐
          </h2>
          <p className="text-gray-300 mb-6">
            Discover the mystical realms, legendary characters, and epic adventures awaiting in MythRealms
          </p>
          <Link
            to="/showcase"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            <span className="mr-2">🚀</span>
            Enter the Showcase
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;