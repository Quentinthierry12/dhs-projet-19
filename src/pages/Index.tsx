
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllApplicationForms } from "@/lib/application-service";
import { ApplicationForm } from "@/types/police";
import { useQuery } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  const { data: applicationForms = [] } = useQuery({
    queryKey: ['application-forms-public'],
    queryFn: () => getAllApplicationForms(true), // Only active forms
  });

  const handleAuthClick = () => {
    console.log('Auth button clicked, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to dashboard');
      navigate('/dashboard');
    } else {
      console.log('User not authenticated, navigating to auth');
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-letc-blue text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">DHS</h1>
            <span className="hidden md:inline text-sm">Department of Homeland Security</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-letc-darkblue"
              onClick={() => navigate('/competitions')}
            >
              🧪 Concours
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-letc-darkblue"
              onClick={() => navigate('/results')}
            >
              📁 Résultats
            </Button>
            <Button 
              onClick={handleAuthClick} 
              variant="ghost" 
              className="text-white hover:bg-letc-darkblue"
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? "Chargement..." : (isAuthenticated ? "Tableau de bord" : "Se connecter")}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="bg-letc-darkblue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Department of Homeland Security</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
             Department of Homeland Security | Law Enforcement Trainning Program
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              className="bg-white text-letc-darkblue hover:bg-gray-100"
              onClick={() => navigate('/competitions')}
            >
              🧪 Voir les Concours
            </Button>
            <Button 
              size="lg"
              className="bg-white text-letc-darkblue hover:bg-gray-10"
              onClick={() => navigate('/results')}
            >
              📁 Consulter les Résultats
            </Button>
            <Button
              size="lg"
              className="bg-white text-letc-darkblue hover:bg-gray-100"
              onClick={() => navigate('/agent')}
            >
              🔑 Connection agent
            </Button>
          </div>
        </div>
      </section>
      
      {/* Application forms section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Formations disponibles</h2>
          
          {applicationForms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">Aucun formulaire de candidature disponible actuellement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applicationForms.map((form) => (
                <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{form.name}</CardTitle>
                    <CardDescription>{form.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-letc-blue hover:bg-letc-darkblue"
                      onClick={() => navigate(`/apply/${form.id}`)}
                    >
                      Postuler
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-letc-blue text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Department of Homeland Security. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
