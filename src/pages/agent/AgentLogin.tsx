
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgentLoginForm from '@/components/agent/AgentLoginForm';
import AgentDashboard from './AgentDashboard';

const AgentLogin = () => {
  const [agent, setAgent] = useState<any>(null);

  const handleLogin = (agentData: any) => {
    setAgent(agentData);
  };

  const handleLogout = () => {
    setAgent(null);
  };

  if (agent) {
    return <AgentDashboard agent={agent} onLogout={handleLogout} />;
  }

  return <AgentLoginForm onLogin={handleLogin} />;
};

export default AgentLogin;
