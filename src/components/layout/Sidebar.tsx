
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Chrome as Home, Users, Settings, Briefcase, BookOpen, ShieldCheck, GraduationCap, FileText, LayoutDashboard, Calendar, TriangleAlert as AlertTriangle, MessageSquare, ListChecks, Building2, Badge as BadgeIcon, KeyRound, Eye, UserPlus, Activity, LogOut, Lock, Library } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const [activeTab, setActiveTab] = useState<string>("formation");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className={`w-64 bg-letc-blue text-white min-h-screen ${className || ''}`}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">USMS</h1>
        <p className="text-sm mb-6">United States Marshal Service</p>
      </div>

      {/* Onglets thématiques */}
      <div className="px-4 mb-4">
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab("formation")}
            className={`px-3 py-2 rounded text-sm font-medium text-left transition-colors ${
              activeTab === "formation"
                ? "bg-letc-darkblue text-white"
                : "bg-gray-600 hover:bg-letc-darkblue text-gray-200"
            }`}
          >
            Formation US Marshal Service
          </button>
          {role === 'direction' && (
            <>
              <button
                onClick={() => setActiveTab("police")}
                className={`px-3 py-2 rounded text-sm font-medium text-left transition-colors ${
                  activeTab === "police" 
                    ? "bg-letc-darkblue text-white" 
                    : "bg-gray-600 hover:bg-letc-darkblue text-gray-200"
                }`}
              >
                Effectif Police
              </button>
              <button
                onClick={() => setActiveTab("direction")}
                className={`px-3 py-2 rounded text-sm font-medium text-left transition-colors ${
                  activeTab === "direction" 
                    ? "bg-letc-darkblue text-white" 
                    : "bg-gray-600 hover:bg-letc-darkblue text-gray-200"
                }`}
              >
                Direction
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="px-4">
        {/* Section Formation LETC */}
        {activeTab === "formation" && (
          <div className="mb-6">
            <h3 className="text-xs uppercase text-gray-300 mb-3 font-semibold">FORMATION US Marshal Service</h3>
            <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Home className="h-4 w-4" />
              <span>Tableau de bord</span>
            </Link>
            <Link to="/candidates" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Users className="h-4 w-4" />
              <span>Candidats</span>
            </Link>
            <Link to="/modules" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <BookOpen className="h-4 w-4" />
              <span>Modules</span>
            </Link>
            <Link to="/classes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Calendar className="h-4 w-4" />
              <span>Classes</span>
            </Link>
            <Link to="/resources" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Library className="h-4 w-4" />
              <span>Ressources</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </Link>

            {/* Section pour les instructeurs */}
            {role === 'instructeur' && (
              <>
                <Link to="/instructor/classes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Mes Classes</span>
                </Link>
                <Link to="/instructor/alerts" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Alertes</span>
                </Link>
                <Link to="/instructor/messages" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
                <Link to="/quiz" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Quiz</span>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Section Effectif Police */}
        {activeTab === "police" && role === 'direction' && (
          <div className="mb-6">
            <h3 className="text-xs uppercase text-gray-300 mb-3 font-semibold">EFFECTIF US Marshal Service</h3>
            <Link to="/direction/agents" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Briefcase className="h-4 w-4" />
              <span>Agents</span>
            </Link>
            <Link to="/police/agencies" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Building2 className="h-4 w-4" />
              <span>Services</span>
            </Link>
            <Link to="/direction/trainings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <GraduationCap className="h-4 w-4" />
              <span>Formations</span>
            </Link>
            <Link to="/police/specialties" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Spécialités</span>
            </Link>
            <Link to="/direction/disciplines" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <FileText className="h-4 w-4" />
              <span>Discipline</span>
            </Link>
          </div>
        )}

        {/* Section Direction */}
        {activeTab === "direction" && role === 'direction' && (
          <div className="mb-6">
            <h3 className="text-xs uppercase text-gray-300 mb-3 font-semibold">DIRECTION</h3>
            <Link to="/direction/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Eye className="h-4 w-4" />
              <span>Vue d'ensemble</span>
            </Link>
            <Link to="/direction/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Users className="h-4 w-4" />
              <span>Utilisateurs</span>
            </Link>
            <Link to="/direction/resources" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Library className="h-4 w-4" />
              <span>Gestion Ressources</span>
            </Link>
            <Link to="/direction/activity-logs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
              <Activity className="h-4 w-4" />
              <span>Logs d'activité</span>
            </Link>
            {/* Section Concours */}
            <div className="mt-6">
              <h4 className="text-xs uppercase text-gray-400 mb-2 font-semibold">CONCOURS</h4>
              <Link to="/direction/competitions" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                <LayoutDashboard className="h-4 w-4" />
                <span>Gestion des concours</span>
              </Link>
              <Link to="/competitions/results" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                <FileText className="h-4 w-4" />
                <span>Résultats des concours</span>
              </Link>
            </div>

            {/* Section Candidatures */}
            <div className="mt-6">
              <h4 className="text-xs uppercase text-gray-400 mb-2 font-semibold">CANDIDATURES</h4>
              <Link to="/applications/forms" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                <FileText className="h-4 w-4" />
                <span>Types de formulaires</span>
              </Link>
              <Link to="/applications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-letc-darkblue rounded-md transition-colors mb-1">
                <ListChecks className="h-4 w-4" />
                <span>Candidatures reçues</span>
              </Link>
            </div>
          </div>
        )}

        {/* User info at bottom */}
        <div className="mt-auto pt-4 border-t border-letc-darkblue">
          <div className="flex items-center gap-3 px-3 py-2 text-sm">
            <div className="w-8 h-8 bg-letc-darkblue rounded-full flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-gray-300 capitalize">{role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors mt-2 w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
