import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthRoute from "@/components/auth/AuthRoute";
import DirectionRoute from "@/components/auth/DirectionRoute";
import InstructorRoute from "@/components/auth/InstructorRoute";
import AppLayout from "@/components/layout/AppLayout";

// Pages imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddCandidate from "./pages/AddCandidate";
import CandidatesList from "./pages/CandidatesList";
import CandidateDetail from "./pages/CandidateDetail";
import AddClass from "./pages/AddClass";
import ClassesList from "./pages/ClassesList";
import ClassDetail from "./pages/ClassDetail";
import ModulesList from "./pages/ModulesList";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ResourcesList from "./pages/resources/ResourcesList";

// Direction pages
import DirectionDashboard from "./pages/direction/Dashboard";
import DirectionDiscipline from "./pages/direction/DirectionDiscipline";
import DirectionTrainings from "./pages/direction/DirectionTrainings";
import UsersList from "./pages/direction/UsersList";
import AddUser from "./pages/direction/AddUser";
import EditUser from "./pages/direction/EditUser";
import ActivityLogs from "./pages/direction/ActivityLogs";
import ManageResources from "./pages/direction/ManageResources";
import DirectionCompetitionsList from "./pages/competitions/DirectionCompetitionsList";
import CreateCompetition from "./pages/competitions/CreateCompetition";
import EditCompetition from "./pages/competitions/EditCompetition";
import CompetitionQuestions from "./pages/competitions/CompetitionQuestions";
import CorrectCompetition from "./pages/competitions/CorrectCompetition";
import CompetitionResults from "./pages/competitions/CompetitionResults";
import CompetitionInvitations from "./pages/competitions/CompetitionInvitations";

// Instructor pages
import InstructorClasses from "./pages/instructor/InstructorClasses";
import InstructorClassDetail from "./pages/instructor/InstructorClassDetail";
import InstructorSchedule from "./pages/instructor/InstructorSchedule";

// Police pages
import AgenciesList from "./pages/police/AgenciesList";
import AddAgency from "./pages/police/AddAgency";
import EditAgency from "./pages/police/EditAgency";
import AgencyDetail from "./pages/police/AgencyDetail";
import AgentsList from "./pages/police/AgentsList";
import AddAgent from "./pages/police/AddAgent";
import AgentDetail from "./pages/police/AgentDetail";
import TrainingsList from "./pages/police/TrainingsList";
import AddTraining from "./pages/police/AddTraining";
import TrainingDetail from "./pages/police/TrainingDetail";
import DisciplineTemplates from "./pages/police/DisciplineTemplates";
import AddDisciplineTemplate from "./pages/police/AddDisciplineTemplate";
import DisciplineRecordsList from "./pages/police/DisciplineRecordsList";
import DisciplineList from "./pages/police/DisciplineList";
import SystemTemplates from "./pages/police/SystemTemplates";
import DbStatus from "./pages/police/DbStatus";
import SpecialtiesList from "./pages/police/SpecialtiesList";
import AddSpecialty from "./pages/police/AddSpecialty";
import UniformsList from "./pages/police/UniformsList";

// Application pages
import ApplicationFormsList from "./pages/applications/ApplicationFormsList";
import CreateApplicationForm from "./pages/applications/CreateApplicationForm";
import ApplicationFormDetail from "./pages/applications/ApplicationFormDetail";
import EditApplicationForm from "./pages/applications/EditApplicationForm";
import ApplicationsList from "./pages/applications/ApplicationsList";
import ApplicationDetail from "./pages/applications/ApplicationDetail";
import PublicApplicationForm from "./pages/applications/PublicApplicationForm";

// Competition pages
import CompetitionsList from "./pages/competitions/CompetitionsList";
import CompetitionLogin from "./pages/competitions/CompetitionLogin";
import CompetitionParticipate from "./pages/competitions/CompetitionParticipate";
import ResultsPage from "./pages/competitions/ResultsPage";

// Training pages
import TrainingResultsPage from "./pages/training/TrainingResultsPage";
import AgentLogin from "./pages/agent/AgentLogin";

export const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - these must come first */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/agent" element={<AgentLogin />} />
            <Route path="/competitions" element={<CompetitionsList />} />
            <Route path="/competition/:competitionId/login" element={<CompetitionLogin />} />
            <Route path="/competition/:competitionId/participate" element={<CompetitionParticipate />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/training-results" element={<TrainingResultsPage />} />
            <Route path="/application/:formId" element={<PublicApplicationForm />} />

            {/* Protected routes with AppLayout - use nested routes */}
            <Route path="/dashboard" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/resources" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<ResourcesList />} />
            </Route>
            <Route path="/candidates" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<CandidatesList />} />
              <Route path="add" element={<AddCandidate />} />
              <Route path=":id" element={<CandidateDetail />} />
            </Route>
            <Route path="/classes" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<ClassesList />} />
              <Route path="add" element={<AddClass />} />
              <Route path=":id" element={<ClassDetail />} />
            </Route>
            <Route path="/modules" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<ModulesList />} />
            </Route>
            <Route path="/settings" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<Settings />} />
            </Route>

            {/* Police routes */}
            <Route path="/police" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route path="agencies" element={<AgenciesList />} />
              <Route path="agencies/add" element={<AddAgency />} />
              <Route path="agencies/:id" element={<AgencyDetail />} />
              <Route path="agencies/:id/edit" element={<EditAgency />} />
              <Route path="agents" element={<AgentsList />} />
              <Route path="agents/add" element={<AddAgent />} />
              <Route path="agents/:agentId" element={<AgentDetail />} />
              <Route path="trainings" element={<TrainingsList />} />
              <Route path="trainings/add" element={<AddTraining />} />
              <Route path="trainings/:id" element={<TrainingDetail />} />
              <Route path="discipline-templates" element={<DisciplineTemplates />} />
              <Route path="discipline-templates/add" element={<AddDisciplineTemplate />} />
              <Route path="discipline-templates/:id" element={<DisciplineTemplates />} />
              <Route path="discipline-templates/:id/edit" element={<AddDisciplineTemplate />} />
              <Route path="discipline-records" element={<DisciplineRecordsList />} />
              <Route path="discipline" element={<DisciplineList />} />
              <Route path="system-templates" element={<SystemTemplates />} />
              <Route path="db-status" element={<DbStatus />} />
              <Route path="specialties" element={<SpecialtiesList />} />
              <Route path="specialties/add" element={<AddSpecialty />} />
              <Route path="uniforms" element={<UniformsList />} />
            </Route>

            {/* Application routes */}
            <Route path="/applications" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<ApplicationsList />} />
              <Route path="forms" element={<ApplicationFormsList />} />
              <Route path="forms/create" element={<CreateApplicationForm />} />
              <Route path="forms/:id" element={<ApplicationFormDetail />} />
              <Route path="forms/:id/edit" element={<EditApplicationForm />} />
              <Route path=":id" element={<ApplicationDetail />} />
            </Route>

            {/* Instructor routes */}
            <Route path="/instructor" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route path="classes" element={<InstructorRoute><InstructorClasses /></InstructorRoute>} />
              <Route path="classes/:id" element={<InstructorRoute><InstructorClassDetail /></InstructorRoute>} />
              <Route path="schedule" element={<InstructorRoute><InstructorSchedule /></InstructorRoute>} />
            </Route>

            {/* Direction routes */}
            <Route path="/direction" element={<AuthRoute><AppLayout /></AuthRoute>}>
              <Route index element={<DirectionRoute><DirectionDashboard /></DirectionRoute>} />
              <Route path="dashboard" element={<DirectionRoute><DirectionDashboard /></DirectionRoute>} />
              <Route path="discipline" element={<DirectionRoute><DirectionDiscipline /></DirectionRoute>} />
              <Route path="disciplines" element={<DirectionRoute><DirectionDiscipline /></DirectionRoute>} />
              <Route path="trainings" element={<DirectionRoute><DirectionTrainings /></DirectionRoute>} />
              <Route path="agents" element={<DirectionRoute><AgentsList /></DirectionRoute>} />
              <Route path="users" element={<DirectionRoute><UsersList /></DirectionRoute>} />
              <Route path="users/add" element={<DirectionRoute><AddUser /></DirectionRoute>} />
              <Route path="users/:id/edit" element={<DirectionRoute><EditUser /></DirectionRoute>} />
              <Route path="activity-logs" element={<DirectionRoute><ActivityLogs /></DirectionRoute>} />
              <Route path="logs" element={<DirectionRoute><ActivityLogs /></DirectionRoute>} />
              <Route path="resources" element={<DirectionRoute><ManageResources /></DirectionRoute>} />
              <Route path="competitions" element={<DirectionRoute><DirectionCompetitionsList /></DirectionRoute>} />
              <Route path="competitions/create" element={<DirectionRoute><CreateCompetition /></DirectionRoute>} />
              <Route path="competitions/:id/edit" element={<DirectionRoute><EditCompetition /></DirectionRoute>} />
              <Route path="competitions/:id/questions" element={<DirectionRoute><CompetitionQuestions /></DirectionRoute>} />
              <Route path="competitions/:id/correct" element={<DirectionRoute><CorrectCompetition /></DirectionRoute>} />
              <Route path="competitions/:id/invitations" element={<DirectionRoute><CompetitionInvitations /></DirectionRoute>} />
              <Route path="competitions/results" element={<DirectionRoute><CompetitionResults /></DirectionRoute>} />
            </Route>

            {/* 404 route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;