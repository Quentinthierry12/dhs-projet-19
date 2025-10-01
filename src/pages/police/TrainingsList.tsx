
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, FileEdit, Trash2, ExternalLink } from "lucide-react";
import { getAllTrainings } from "@/lib/police-service";

const TrainingsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: trainings = [], isLoading, error } = useQuery({
    queryKey: ['trainings'],
    queryFn: getAllTrainings
  });
  
  // Filter trainings based on search term
  const filteredTrainings = trainings.filter(training => 
    training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (training.description && training.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Formations spécifiques</h1>
          <Link to="/police/trainings/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Formation
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Liste des formations</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une formation..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Chargement des formations...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-500 rounded-md p-4 text-center m-4">
                Une erreur est survenue lors du chargement des formations.
              </div>
            ) : filteredTrainings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-4">
                {searchTerm ? "Aucune formation ne correspond à votre recherche." : "Aucune formation n'a été ajoutée."}
                <p className="mt-4">
                  <Link to="/police/trainings/add">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une formation
                    </Button>
                  </Link>
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="block md:hidden">
                  {filteredTrainings.map(training => (
                    <div key={training.id} className="border-b last:border-b-0 p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{training.title}</h3>
                          <p className="text-sm text-gray-600">{training.agencyName}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {training.description || "—"}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/police/trainings/${training.id}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                <span>Voir détails</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/police/trainings/${training.id}/edit`}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                <span>Modifier</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Agence</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrainings.map(training => (
                        <TableRow key={training.id}>
                          <TableCell className="font-medium">{training.title}</TableCell>
                          <TableCell>{training.agencyName}</TableCell>
                          <TableCell className="truncate max-w-xs">
                            {training.description || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/police/trainings/${training.id}`}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    <span>Voir détails</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/police/trainings/${training.id}/edit`}>
                                    <FileEdit className="mr-2 h-4 w-4" />
                                    <span>Modifier</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Supprimer</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingsList;
