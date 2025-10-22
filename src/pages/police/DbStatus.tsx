
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DbStatus = () => {
  const { data: dbStatus, isLoading, refetch } = useQuery({
    queryKey: ['db-status'],
    queryFn: async () => {
      try {
        // Test database connection
        const { data, error } = await supabase
          .from('dhs_police_agents')
          .select('count', { count: 'exact', head: true });

        if (error) {
          return {
            status: 'error',
            lastUpdate: new Date().toISOString(),
            error: error.message
          };
        }

        return {
          status: 'connected',
          lastUpdate: new Date().toISOString(),
          agentCount: data?.length || 0
        };
      } catch (error) {
        return {
          status: 'error',
          lastUpdate: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-letc-blue">État de la Base de Données</h1>
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connexion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Vérification en cours...</p>
                </div>
              ) : dbStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(dbStatus.status)}
                    <Badge className={getStatusColor(dbStatus.status)}>
                      {dbStatus.status === 'connected' ? 'Connecté' : 'Erreur'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dernière vérification:</p>
                    <p className="font-mono text-sm">
                      {new Date(dbStatus.lastUpdate).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {dbStatus.status === 'error' && dbStatus.error && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-sm text-red-700 font-semibold">Erreur:</p>
                      <p className="text-sm text-red-600 font-mono">{dbStatus.error}</p>
                    </div>
                  )}
                  {dbStatus.status === 'connected' && 'agentCount' in dbStatus && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-700">
                        Base de données opérationnelle
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Version du système:</p>
                  <p className="font-semibold">USMS v2.0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tables principales:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">dhs_police_agents</Badge>
                    <Badge variant="outline" className="text-xs">dhs_agencies</Badge>
                    <Badge variant="outline" className="text-xs">dhs_grades</Badge>
                    <Badge variant="outline" className="text-xs">dhs_competitions</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dernière migration:</p>
                  <p className="font-mono text-sm">2025-06-14</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connexion
              </Button>
              <Button variant="outline" disabled>
                <Database className="h-4 w-4 mr-2" />
                Sauvegarde
              </Button>
              <Button variant="outline" disabled>
                <AlertCircle className="h-4 w-4 mr-2" />
                Logs Système
              </Button>
              <Button variant="outline" disabled>
                <CheckCircle className="h-4 w-4 mr-2" />
                Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DbStatus;
