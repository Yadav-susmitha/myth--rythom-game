import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Import components (we'll create these)
import Dashboard from "./components/Dashboard";
import Navigation from "./components/Navigation";
import DocumentManager from "./components/DocumentManager";
import CharacterManager from "./components/CharacterManager";  
import WeaponManager from "./components/WeaponManager";
import QuestManager from "./components/QuestManager";
import MusicManager from "./components/MusicManager";
import AssetManager from "./components/AssetManager";
import ShowcaseHome from "./components/ShowcaseHome";
import SearchResults from "./components/SearchResults";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API,
  timeout: 10000,
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState("checking");

  // Check API connectivity on app start
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await apiClient.get("/");
        console.log("API Connected:", response.data.message);
        setApiStatus("connected");
      } catch (error) {
        console.error("API Connection Failed:", error);
        setApiStatus("error");
      } finally {
        setIsLoading(false);
      }
    };

    checkAPI();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading MythRealms Platform...</p>
        </div>
      </div>
    );
  }

  if (apiStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-pink-900">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">API Connection Error</h1>
          <p className="text-red-200">Unable to connect to the MythRealms backend. Please check the server status.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <BrowserRouter>
        <div className="flex min-h-screen">
          {/* Navigation Sidebar */}
          <Navigation />
          
          {/* Main Content Area */}
          <div className="flex-1 ml-64">
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* GDD Management */}
              <Route path="/documents" element={<DocumentManager />} />
              <Route path="/documents/:documentId" element={<DocumentManager />} />
              
              {/* Content Management */}
              <Route path="/characters" element={<CharacterManager />} />
              <Route path="/weapons" element={<WeaponManager />} />
              <Route path="/quests" element={<QuestManager />} />
              <Route path="/music" element={<MusicManager />} />
              <Route path="/assets" element={<AssetManager />} />
              
              {/* Showcase */}
              <Route path="/showcase" element={<ShowcaseHome />} />
              
              {/* Search */}
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;