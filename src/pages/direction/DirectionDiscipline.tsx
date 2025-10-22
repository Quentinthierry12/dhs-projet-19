import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllDisciplinaryRecords } from "@/lib/police-service";
import { formatDate } from "@/lib/date-utils";
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
import { Eye, Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DirectionDiscipline = () => {
  const navigate = useNavigate();
  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ['disciplinary-records'],
    queryFn: () => getAllDisciplinaryRecords(),
  });

  console.log('Direction discipline records:', records);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Gestion Disciplinaire</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/police/discipline-templates')}
            variant="outline"
            className="bg-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Modèles
          </Button>
          <Button 
            onClick={() => navigate('/police/discipline-templates/add')}
            className="bg-letc-blue hover:bg-letc-darkblue"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle sanction
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {records.filter(r => r.type === 'warning').length}
            </div>
            <p className="text-sm text-gray-600">Avertissements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {records.filter(r => r.type === 'reprimand').length}
            </div>
            <p className="text-sm text-gray-600">Réprimandes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {records.filter(r => r.type === 'suspension').length}
            </div>
            <p className="text-sm text-gray-600">Suspensions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-800">
              {records.filter(r => r.type === 'termination').length}
            </div>
            <p className="text-sm text-gray-600">Renvois</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sanctions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement des sanctions...</div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              <p>Erreur lors du chargement des sanctions</p>
              <p className="text-sm mt-2">{error.message}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Aucune sanction enregistrée</p>
              <p className="text-sm mt-2">
                Les sanctions disciplinaires apparaîtront ici une fois créées.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Émis par</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.slice(0, 10).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.agentName || 'Agent inconnu'}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          record.type === "warning" ? "bg-yellow-500" : 
                          record.type === "reprimand" ? "bg-orange-500" : 
                          record.type === "suspension" ? "bg-red-500" : 
                          "bg-red-800"
                        }
                      >
                        {record.type === "warning" ? "Avertissement" :
                         record.type === "reprimand" ? "Réprimande" :
                         record.type === "suspension" ? "Suspension" :
                         "Renvoi"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.issuedAt || record.date)}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.reason}</TableCell>
                    <TableCell>{record.issuedBy}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/police/discipline-records`)}
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

export default DirectionDiscipline;
