
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getResources } from '@/lib/resource-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const ResourcesList: React.FC = () => {
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: getResources,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p>Chargement des ressources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p>Erreur: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Bibliothèque de Ressources</CardTitle>
          <CardDescription>Retrouvez ici tous les documents et liens utiles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources?.map((resource) => (
              <a href={resource.url} target="_blank" rel="noopener noreferrer" key={resource.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <FileText className="w-8 h-8 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <p className="text-sm text-gray-500">{resource.category}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesList;
