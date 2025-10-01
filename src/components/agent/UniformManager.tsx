
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shirt, Plus, Eye, Edit } from 'lucide-react';
import { getUniforms, createUniform } from '@/lib/police-service';
import { toast } from 'sonner';

interface UniformManagerProps {
  agent: any;
}

const UniformManager = ({ agent }: UniformManagerProps) => {
  const [uniforms, setUniforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    maskFacialHair: 1,
    handsUpperBody: 5,
    legsPants: 21,
    bagsParachutes: 18,
    shoes: 19,
    neckScarfs: 317,
    shirtAccessories: 58,
    bodyArmorAccessories: 228,
    badgesLogos: '',
    shirtOverlayJackets: 31,
    hatsHelmets: 46,
  });

  useEffect(() => {
    loadUniforms();
  }, []);

  const loadUniforms = async () => {
    try {
      const data = await getUniforms();
      setUniforms(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des tenues');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom de la tenue est requis');
      return;
    }

    try {
      await createUniform({
        ...formData,
        createdBy: agent.name,
        agencyId: agent.agencyId,
      });

      toast.success('Tenue créée avec succès');
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        maskFacialHair: 1,
        handsUpperBody: 5,
        legsPants: 21,
        bagsParachutes: 18,
        shoes: 19,
        neckScarfs: 317,
        shirtAccessories: 58,
        bodyArmorAccessories: 228,
        badgesLogos: '',
        shirtOverlayJackets: 31,
        hatsHelmets: 46,
      });
      loadUniforms();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la tenue');
    }
  };

  const uniformFields = [
    { key: 'maskFacialHair', label: 'Mask/Facial Hair' },
    { key: 'handsUpperBody', label: 'Hands / Upper Body' },
    { key: 'legsPants', label: 'Legs / Pants' },
    { key: 'bagsParachutes', label: 'Bags / Parachutes' },
    { key: 'shoes', label: 'Shoes' },
    { key: 'neckScarfs', label: 'Neck / Scarfs' },
    { key: 'shirtAccessories', label: 'Shirt / Accessories' },
    { key: 'bodyArmorAccessories', label: 'Body Armor / Accessories' },
    { key: 'shirtOverlayJackets', label: 'Shirt Overlay / Jackets' },
    { key: 'hatsHelmets', label: 'Hats/Helmets' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Shirt className="h-6 w-6" />
          <span>Gestion des Tenues</span>
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouvelle Tenue</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tenue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la tenue</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nom de la tenue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description de la tenue"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL de l'image</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Badges / Logos (texte)</label>
                <Input
                  value={formData.badgesLogos}
                  onChange={(e) => handleInputChange('badgesLogos', e.target.value)}
                  placeholder="Description des badges/logos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {uniformFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-1">{field.label}</label>
                    <Input
                      type="number"
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>
                  Créer la tenue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des tenues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Chargement des tenues...</p>
        ) : uniforms.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">
            Aucune tenue créée
          </p>
        ) : (
          uniforms.map((uniform) => (
            <Card key={uniform.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{uniform.name}</CardTitle>
                  <Badge variant="outline">{uniform.agencyName}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {uniform.imageUrl && (
                  <div className="mb-3">
                    <img
                      src={uniform.imageUrl}
                      alt={uniform.name}
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {uniform.description && (
                  <p className="text-sm text-gray-600 mb-3">{uniform.description}</p>
                )}
                
                <div className="space-y-1 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    {uniformFields.slice(0, 6).map((field) => (
                      <div key={field.key} className="flex justify-between">
                        <span className="text-gray-500 truncate">{field.label}:</span>
                        <span className="font-mono">{uniform[field.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <span>Par {uniform.createdBy}</span>
                  <span>{new Date(uniform.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UniformManager;
