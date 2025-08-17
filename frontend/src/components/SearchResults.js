import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiClient } from "../App";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, []);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/search?query=${encodeURIComponent(searchQuery)}`);
      setResults(response.data);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return Object.values(results).reduce((total, items) => total + items.length, 0);
  };

  const renderResultSection = (title, items, icon, linkPrefix) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">{icon}</span>
          {title} ({items.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`${linkPrefix}/${item.id}`}
              className="glass-card p-4 rounded-lg hover-lift"
            >
              <h4 className="font-semibold text-white mb-2 line-clamp-1">
                {item.title || item.name}
              </h4>
              <p className="text-gray-300 text-sm line-clamp-3">
                {item.description || item.lore || Object.values(item.content || {})[0] || "No description"}
              </p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge badge-gray text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {item.created_at && new Date(item.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Search MythRealms</h1>
        <p className="text-gray-400">Find documents, characters, weapons, quests, and more</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-2xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything in MythRealms..."
            className="form-input flex-1"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary flex items-center px-6"
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Searching...
              </>
            ) : (
              <>
                <span className="mr-2">🔍</span>
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin mx-auto mb-4 h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-400">Searching MythRealms universe...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-8">
          {getTotalResults() > 0 ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-white">
                  Search Results for "{query}"
                </h2>
                <span className="text-gray-400">
                  {getTotalResults()} total results
                </span>
              </div>

              {renderResultSection("Documents", results.documents, "📄", "/documents")}
              {renderResultSection("Characters", results.characters, "👤", "/characters")}
              {renderResultSection("Weapons", results.weapons, "⚔️", "/weapons")}
              {renderResultSection("Quests", results.quests, "📋", "/quests")}
              {renderResultSection("Music", results.music, "🎵", "/music")}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400 mb-6">
                No content found for "{query}". Try different search terms.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Search tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Try broader terms</li>
                  <li>Check spelling</li>
                  <li>Search for character names, weapon types, or realm names</li>
                  <li>Use tags like "forest", "combat", "mystical"</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!results && !loading && (
        <div className="glass-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Search Suggestions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { term: "forest", icon: "🌲" },
              { term: "sword", icon: "⚔️" },
              { term: "hero", icon: "⭐" },
              { term: "boss", icon: "👹" },
              { term: "music", icon: "🎵" },
              { term: "quest", icon: "📋" },
              { term: "mystical", icon: "✨" },
              { term: "combat", icon: "🥊" }
            ].map((suggestion) => (
              <button
                key={suggestion.term}
                onClick={() => {
                  setQuery(suggestion.term);
                  performSearch(suggestion.term);
                }}
                className="flex items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <span className="mr-2 text-lg">{suggestion.icon}</span>
                <span className="text-white capitalize">{suggestion.term}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;