
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getClasses } from "@/lib/data-service";
import { Class } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { School, Users, Calendar, Plus } from "lucide-react";

const ClassesList = () => {
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Classes</h1>
        <Link to="/classes/add">
          <Button className="bg-letc-blue hover:bg-letc-darkblue">
            <Plus className="h-4 w-4 mr-2" />
            Créer une classe
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <h2 className="mt-4 text-2xl font-semibold">Chargement...</h2>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12">
          <School className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-semibold">Aucune classe</h2>
          <p className="mt-2 text-gray-500">Commencez par créer votre première classe</p>
          <Link to="/classes/add">
            <Button className="mt-4 bg-letc-blue hover:bg-letc-darkblue">
              <Plus className="h-4 w-4 mr-2" />
              Créer une classe
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem: Class) => (
            <Card key={classItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <Badge>{classItem.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <School className="h-4 w-4 mr-2" />
                    {classItem.instructorName}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {classItem.candidateIds.length} candidat{classItem.candidateIds.length !== 1 && 's'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(classItem.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  
                  <Link to={`/classes/${classItem.id}`}>
                    <Button variant="outline" className="w-full mt-4">
                      Voir les détails
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesList;
