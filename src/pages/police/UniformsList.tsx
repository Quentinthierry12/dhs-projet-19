
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Shirt, Search } from 'lucide-react';
import { getUniforms } from '@/lib/police-service';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const UniformsList = () => {
  const [uniforms, setUniforms] = useState<any[]>([]);
  const [filteredUniforms, setFilteredUniforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUniforms();
  }, []);

  useEffect(() => {
    const filtered = uniforms.filter(uniform =>
      uniform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uniform.agencyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uniform.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUniforms(filtered);
  }, [uniforms, searchTerm]);

  const loadUniforms = async () => {
    try {
      const data = await getUniforms();
      setUniforms(data);
      setFilteredUniforms(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des tenues');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-letc-blue flex items-center space-x-2">
          <Shirt className="h-8 w-8" />
          <span>Gestion des Tenues</span>
        </h1>
        
        <Link to="/police/uniforms/add">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouvelle Tenue</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher une tenue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold">Chargement...</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniforms.map((uniform) => (
            <Card key={uniform.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{uniform.name}</CardTitle>
                  <Badge variant="outline">{uniform.agencyName || 'Général'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {uniform.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={uniform.imageUrl}
                      alt={uniform.name}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {uniform.description && (
                  <p className="text-sm text-gray-600 mb-4">{uniform.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Masque:</span>
                      <span className="font-mono">{uniform.maskFacialHair}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mains:</span>
                      <span className="font-mono">{uniform.handsUpperBody}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Jambes:</span>
                      <span className="font-mono">{uniform.legsPants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sacs:</span>
                      <span className="font-mono">{uniform.bagsParachutes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chaussures:</span>
                      <span className="font-mono">{uniform.shoes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Casque:</span>
                      <span className="font-mono">{uniform.hatsHelmets}</span>
                    </div>
                  </div>
                  
                  {uniform.badgesLogos && (
                    <div className="mt-2">
                      <span className="text-gray-500 text-xs">Badges: </span>
                      <span className="text-xs">{uniform.badgesLogos}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs text-gray-500">
                  <span>Par {uniform.createdBy}</span>
                  <span>{new Date(uniform.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredUniforms.length === 0 && (
        <div className="text-center py-12">
          <Shirt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600">Aucune tenue trouvée</h2>
          <p className="text-gray-500 mt-2">
            {searchTerm ? 'Aucune tenue ne correspond à votre recherche.' : 'Commencez par créer votre première tenue.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UniformsList;
