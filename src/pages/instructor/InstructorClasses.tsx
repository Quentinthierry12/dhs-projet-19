
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAllClasses } from "@/lib/data-service";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface ClassData {
  id: string;
  name: string;
  status: string;
  candidateCount: number;
  startDate: string;
  endDate: string;
  instructorId?: string;
}

const InstructorClasses = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadClasses = async () => {
      try {
        setIsLoading(true);
        const allClasses = await getAllClasses();
        // In a real app, filter classes by instructor ID
        const instructorClasses = allClasses.map(c => ({
          id: c.id,
          name: c.name,
          status: "active",
          candidateCount: c.candidateIds?.length || 0,
          startDate: "01/05/2025",
          endDate: "30/05/2025",
        }));
        setClasses(instructorClasses);
      } catch (error) {
        console.error("Error loading classes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos classes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, [user?.id, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-letc-blue">Mes Classes</h1>
        <p className="text-lg text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Mes Classes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <Card key={classItem.id} className="overflow-hidden">
              <CardHeader className="bg-letc-blue text-white">
                <CardTitle className="truncate">{classItem.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">État:</span>
                    <Badge variant={classItem.status === "active" ? "default" : "secondary"}
                      className={classItem.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}>
                      {classItem.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Candidats:</span>
                    <span>{classItem.candidateCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de début:</span>
                    <span>{classItem.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de fin:</span>
                    <span>{classItem.endDate}</span>
                  </div>
                  <Link to={`/classes/${classItem.id}`} className="w-full">
                    <Button className="w-full bg-letc-blue hover:bg-letc-darkblue">
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Vous n'avez pas encore de classes assignées.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorClasses;
