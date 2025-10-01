
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Search, 
  Mail, 
  Shirt, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  LogOut
} from 'lucide-react';
import { searchAgents } from '@/lib/police-service';
import { toast } from 'sonner';
import AgentSearch from '@/components/agent/AgentSearch';
import AgentMessages from '@/components/agent/AgentMessages';
import UniformManager from '@/components/agent/UniformManager';

interface AgentDashboardProps {
  agent: any;
  onLogout: () => void;
}

const AgentDashboard = ({ agent, onLogout }: AgentDashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">NOOSE Agent Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                <p className="text-xs text-gray-500">Badge #{agent.badgeNumber}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Mon Profil</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Recherche</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="uniforms" className="flex items-center space-x-2">
              <Shirt className="h-4 w-4" />
              <span>Tenues</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informations personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="text-lg font-medium">{agent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Matricule</p>
                      <Badge variant="outline" className="text-lg">
                        {agent.badgeNumber}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Agence</p>
                      <p className="text-lg">{agent.agencyName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Grade</p>
                      <p className="text-lg">{agent.gradeName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {agent.phoneNumber && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Téléphone</p>
                          <p className="text-lg">{agent.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {agent.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-lg">{agent.email}</p>
                        </div>
                      </div>
                    )}
                    {agent.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Adresse</p>
                          <p className="text-lg">{agent.address}</p>
                        </div>
                      </div>
                    )}
                    {agent.dateOfBirth && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date de naissance</p>
                          <p className="text-lg">
                            {new Date(agent.dateOfBirth).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <AgentSearch />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <AgentMessages agent={agent} />
          </TabsContent>

          {/* Uniforms Tab */}
          <TabsContent value="uniforms">
            <UniformManager agent={agent} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AgentDashboard;
