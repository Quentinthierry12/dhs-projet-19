import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getApplicationFormById } from "@/lib/application-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, ExternalLink } from "lucide-react";
import { formatDateTime } from "@/lib/date-utils";

const ApplicationFormDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['application-form', id],
    queryFn: () => getApplicationFormById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement du formulaire...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Formulaire non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/applications/forms")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{form.name}</h1>
            <p className="text-muted-foreground mt-1">{form.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/application/${form.id}`} target="_blank">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir le formulaire public
            </Button>
          </Link>
          <Button onClick={() => navigate(`/applications/forms/${form.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <div className="mt-1">
                {form.isActive ? (
                  <Badge className="bg-green-500">Actif</Badge>
                ) : (
                  <Badge variant="outline">Inactif</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de création</p>
              <p className="mt-1">{formatDateTime(form.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Créé par</p>
              <p className="mt-1">{form.createdBy}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre de champs</p>
              <p className="mt-1">{form.fields?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lien du formulaire</CardTitle>
            <CardDescription>Partagez ce lien avec les candidats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
              {window.location.origin}/application/{form.id}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Champs du formulaire ({form.fields?.length || 0})</CardTitle>
          <CardDescription>
            Champs que les candidats devront remplir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {form.fields && form.fields.length > 0 ? (
            <div className="space-y-4">
              {form.fields.map((field, index) => (
                <div key={field.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{field.label}</h4>
                      <p className="text-sm text-muted-foreground">Type: {field.type}</p>
                    </div>
                    {field.required && (
                      <Badge variant="outline" className="text-red-500 border-red-500">
                        Requis
                      </Badge>
                    )}
                  </div>
                  {field.type === "select" && field.options && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-muted-foreground">Options:</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {field.options.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aucun champ défini pour ce formulaire
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationFormDetail;
