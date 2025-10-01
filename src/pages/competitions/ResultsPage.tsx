
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCompetitionResults } from "@/lib/police-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/shared/ExportButton";
import { exportCompetitionResultsPDF } from "@/lib/pdf-service";
import { Search, GraduationCap, CheckCircle, XCircle, Clock } from "lucide-react";

const ResultsPage = () => {
  const [search, setSearch] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['competition-results', search],
    queryFn: () => getCompetitionResults(),
    enabled: searchTriggered && search.length >= 2,
  });

  const handleSearch = () => {
    if (search.length >= 2) {
      setSearchTriggered(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredResults = results.filter(result => {
    const searchTerm = search.toLowerCase();
    return (
      result.participantName.toLowerCase().includes(searchTerm) ||
      (result.participantRio && result.participantRio.toLowerCase().includes(searchTerm))
    );
  });

  const getStatusBadge = (status?: string) => {
    if (status === 'accepted') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepté
        </Badge>
      );
    } else if (status === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Refusé
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Résultats des Concours</h1>
        <Link to="/training-results">
          <Button className="bg-letc-blue hover:bg-letc-darkblue">
            <GraduationCap className="h-4 w-4 mr-2" />
            Voir mes résultats de formation
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rechercher des Résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Nom, prénom ou RIO</Label>
              <Input
                id="search"
                type="text"
                placeholder="Entrez au moins 2 caractères..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={search.length < 2}
              className="bg-letc-blue hover:bg-letc-darkblue"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {!searchTriggered && (
            <div className="text-center py-8 text-gray-500">
              <p>Entrez un nom, prénom ou RIO pour rechercher des résultats</p>
            </div>
          )}

          {searchTriggered && (
            <>
              {isLoading ? (
                <div className="text-center py-4">Chargement des résultats...</div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucun résultat trouvé pour "{search}"</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concours</TableHead>
                          <TableHead>Nom du Participant</TableHead>
                          <TableHead>RIO</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Pourcentage</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.competitionTitle}</TableCell>
                            <TableCell>{result.participantName}</TableCell>
                            <TableCell>{result.participantRio || 'N/A'}</TableCell>
                            <TableCell>{result.score} / {result.maxScore}</TableCell>
                            <TableCell>{result.percentage}%</TableCell>
                            <TableCell>{getStatusBadge(result.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <ExportButton
                      onClick={() => exportCompetitionResultsPDF(filteredResults)}
                    >
                      Exporter les résultats en PDF
                    </ExportButton>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;
