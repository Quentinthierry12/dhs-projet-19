
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllTrainings } from "@/lib/police-service";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Users, BookOpen, Settings, ShieldCheck, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DirectionTrainings = () => {
  const navigate = useNavigate();
  const { data: trainings = [], isLoading, error } = useQuery({
    queryKey: ['direction-trainings'],
    queryFn: getAllTrainings,
  });

  console.log('Direction trainings:', trainings);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Gestion des Formations</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/police/trainings')}
            variant="outline"
            className="bg-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            Vue Police
          </Button>
          <Button 
            onClick={() => navigate('/police/trainings/add')}
            className="bg-letc-blue hover:bg-letc-darkblue"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Formation
          </Button>
        </div>
      </div>

      {/* Boutons de gestion rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/police/specialties')}>
          <CardContent className="pt-6 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-letc-blue" />
            <h3 className="text-lg font-semibold text-letc-blue">Spécialités</h3>
            <p className="text-sm text-gray-600 mt-2">Gérer les spécialités policières</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/direction/disciplines')}>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-letc-blue" />
            <h3 className="text-lg font-semibold text-letc-blue">Disciplines</h3>
            <p className="text-sm text-gray-600 mt-2">Gérer les sanctions disciplinaires</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/police/trainings')}>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-letc-blue" />
            <h3 className="text-lg font-semibold text-letc-blue">Formations</h3>
            <p className="text-sm text-gray-600 mt-2">Gérer les formations spécialisées</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-letc-blue">
              {trainings.length}
            </div>
            <p className="text-sm text-gray-600">Formations totales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {trainings.filter(t => t.agencyName).length}
            </div>
            <p className="text-sm text-gray-600">Formations actives</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(trainings.map(t => t.agencyName)).size}
            </div>
            <p className="text-sm text-gray-600">Agences impliquées</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Formations spécialisées</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement des formations...</div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              <p>Erreur lors du chargement des formations</p>
              <p className="text-sm mt-2">{error.message}</p>
            </div>
          ) : trainings.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune formation enregistrée</p>
              <p className="text-sm mt-2">
                Les formations spécialisées apparaîtront ici une fois créées.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {training.agencyName || 'Non assignée'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {training.description || '—'}
                    </TableCell>
                    <TableCell>
                      {new Date(training.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/police/trainings/${training.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectionTrainings;
