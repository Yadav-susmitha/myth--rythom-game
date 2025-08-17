import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      section: "Overview",
      items: [
        { path: "/", label: "Dashboard", icon: "📊" },
        { path: "/search", label: "Search", icon: "🔍" },
      ]
    },
    {
      section: "GDD Management", 
      items: [
        { path: "/documents", label: "Documents", icon: "📄" },
      ]
    },
    {
      section: "Content Management",
      items: [
        { path: "/characters", label: "Characters", icon: "👤" },
        { path: "/weapons", label: "Weapons", icon: "⚔️" },
        { path: "/quests", label: "Quests", icon: "📋" },
        { path: "/music", label: "Music", icon: "🎵" },
        { path: "/assets", label: "Assets", icon: "🖼️" },
      ]
    },
    {
      section: "Showcase",
      items: [
        { path: "/showcase", label: "MythRealms", icon: "🌟" },
      ]
    }
  ];

  return (
    <nav className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold gradient-text">MythRealms</h1>
              <p className="text-sm text-gray-400">GDD Platform</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            {isCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-lg transition-all group ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        {!isCollapsed && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Stats</h4>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Documents:</span>
                <span className="text-blue-400">-</span>
              </div>
              <div className="flex justify-between">
                <span>Characters:</span>
                <span className="text-green-400">-</span>
              </div>
              <div className="flex justify-between">
                <span>Assets:</span>
                <span className="text-purple-400">-</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;