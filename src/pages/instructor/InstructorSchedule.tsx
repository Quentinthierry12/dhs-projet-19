
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Save, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  className: string;
  isEditing?: boolean;
}

const InstructorSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // Initial schedule items
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: "1",
      title: "Formation Conduite",
      date: "06/05/2025",
      time: "09:00 - 12:00",
      location: "Salle A",
      className: "Promotion Mai 2025"
    },
    {
      id: "2",
      title: "Théorie juridique",
      date: "07/05/2025",
      time: "14:00 - 17:00",
      location: "Salle B",
      className: "Promotion Mai 2025"
    },
    {
      id: "3",
      title: "Exercice pratique",
      date: "08/05/2025",
      time: "10:00 - 16:00",
      location: "Terrain extérieur",
      className: "Promotion Avril 2025"
    }
  ]);

  const toggleEditMode = (id: string) => {
    setScheduleItems(items => 
      items.map(item => 
        item.id === id ? { ...item, isEditing: !item.isEditing } : item
      )
    );
  };

  const updateItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setScheduleItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const saveChanges = (id: string) => {
    // In a real app, you would save changes to the server here
    setScheduleItems(items => 
      items.map(item => 
        item.id === id ? { ...item, isEditing: false } : item
      )
    );
    
    toast({
      title: "Modifications sauvegardées",
      description: "Les modifications ont été enregistrées avec succès."
    });
  };

  const cancelEdit = (id: string) => {
    setScheduleItems(items => 
      items.map(item => 
        item.id === id ? { ...item, isEditing: false } : item
      )
    );
  };

  const instructorName = user?.prenom && user?.nom 
    ? `${user.prenom} ${user.nom}` 
    : "Instructeur";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-letc-blue">Planning</h1>

      <Card>
        <CardHeader className="bg-letc-blue text-white">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Planning de {instructorName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {scheduleItems.map((item) => (
              <div 
                key={item.id} 
                className="border-l-4 border-letc-blue p-4 bg-white shadow rounded-md hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    {item.isEditing ? (
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        className="font-medium text-lg mb-1"
                      />
                    ) : (
                      <h3 className="font-medium text-lg">{item.title}</h3>
                    )}
                    
                    {item.isEditing ? (
                      <Input
                        value={item.className}
                        onChange={(e) => updateItem(item.id, 'className', e.target.value)}
                        className="text-gray-500 mb-2"
                      />
                    ) : (
                      <p className="text-gray-500">{item.className}</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {item.isEditing ? (
                      <Input
                        value={item.date}
                        onChange={(e) => updateItem(item.id, 'date', e.target.value)}
                        className="font-medium mb-1 w-40"
                      />
                    ) : (
                      <p className="font-medium">{item.date}</p>
                    )}
                    
                    {item.isEditing ? (
                      <Input
                        value={item.time}
                        onChange={(e) => updateItem(item.id, 'time', e.target.value)}
                        className="text-gray-500 w-40"
                      />
                    ) : (
                      <p className="text-gray-500">{item.time}</p>
                    )}
                  </div>
                </div>
                
                {item.isEditing ? (
                  <Input
                    value={item.location}
                    onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                    className="mt-2 mb-4"
                    placeholder="Lieu de la session"
                  />
                ) : (
                  <p className="mt-2 text-gray-600">
                    <span className="font-medium">Lieu:</span> {item.location}
                  </p>
                )}
                
                <div className="flex justify-end mt-2">
                  {item.isEditing ? (
                    <div className="space-x-2">
                      <Button 
                        onClick={() => saveChanges(item.id)}
                        size="sm"
                        className="bg-letc-blue hover:bg-letc-darkblue"
                      >
                        <Save className="h-4 w-4 mr-1" /> Sauvegarder
                      </Button>
                      <Button 
                        onClick={() => cancelEdit(item.id)}
                        size="sm"
                        variant="outline"
                      >
                        <X className="h-4 w-4 mr-1" /> Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => toggleEditMode(item.id)}
                      size="sm"
                      variant="outline"
                      className="text-letc-blue hover:bg-letc-blue/10"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Modifier
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {scheduleItems.length === 0 && (
              <p className="text-center text-gray-500 py-6">
                Aucune session de formation planifiée pour le moment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorSchedule;
