
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authenticatePrivateCompetition } from "@/lib/competition-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Home, Lock, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PrivateCompetitionLogin = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: ""
  });

  const loginMutation = useMutation({
    mutationFn: () => authenticatePrivateCompetition(credentials.identifier, credentials.password),
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.invitation.candidateName} !`
        });
        
        // Rediriger vers la page de participation avec les données de l'invitation
        navigate(`/competition/${competitionId}/participate`, {
          state: {
            isPrivate: true,
            invitation: data.invitation,
            participantName: data.invitation.candidateName
          }
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Identifiants incorrects ou invitation déjà utilisée.",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la connexion.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.identifier.trim() || !credentials.password.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-letc-blue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Lock className="h-8 w-8" />
                Concours Privé
              </h1>
              <p className="text-letc-blue-light">Accès sur invitation uniquement</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-white text-letc-blue hover:bg-gray-100"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Connexion requise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Ce concours est privé et nécessite des identifiants de connexion. Si vous n'avez pas reçu d'invitation, contactez l'organisateur.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="identifier">Identifiant d'invitation</Label>
                  <Input
                    id="identifier"
                    value={credentials.identifier}
                    onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value.toUpperCase() })}
                    placeholder="ex: ABC12345"
                    required
                    className="font-mono"
                    maxLength={8}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value.toUpperCase() })}
                    placeholder="Mot de passe fourni"
                    required
                    className="font-mono"
                    maxLength={8}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Vous n'avez pas reçu d'invitation ?</p>
                <p>Contactez l'organisateur du concours.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivateCompetitionLogin;
