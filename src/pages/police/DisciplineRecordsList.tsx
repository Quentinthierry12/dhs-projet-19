import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDisciplinaryRecords } from "@/lib/police-service";
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
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DisciplineRecordsList = () => {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['disciplinary-records'],
    queryFn: () => getDisciplinaryRecords(),
  });

  // Fix the issuedByName reference
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue">Sanctions Disciplinaires</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des sanctions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement des sanctions...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Aucune sanction enregistrée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Émis par</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.agentName}</TableCell>
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
                    <TableCell>{formatDate(record.issuedAt)}</TableCell>
                    <TableCell>{record.issuedBy}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/police/disciplines/${record.id}`)}
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

export default DisciplineRecordsList;
