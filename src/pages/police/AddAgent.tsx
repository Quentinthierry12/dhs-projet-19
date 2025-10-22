import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  createPoliceAgent,
  getPoliceAgencies,
  getPoliceGrades,
} from '@/lib/police-service';
import { Agency, Grade } from '@/types';
import { ArrowLeftIcon, ShieldPlus } from 'lucide-react';

const addAgentFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Le nom doit comporter au moins 2 caractères.',
  }),
  badgeNumber: z.string().min(3, {
    message: 'Le numéro de badge doit comporter au moins 3 caractères.',
  }),
  agencyId: z.string().min(1, {
    message: 'Veuillez sélectionner une agence.',
  }),
  gradeId: z.string().min(1, {
    message: 'Veuillez sélectionner un grade.',
  }),
  status: z.enum(['active', 'inactive', 'suspended', 'retired', 'training'], {
    required_error: 'Veuillez sélectionner un statut.',
  }),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  discordId: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  dateOfBirth: z.string().optional(),
  candidateId: z.string().optional(),
});

type AddAgentFormValues = z.infer<typeof addAgentFormSchema>;

const AddAgent = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<AddAgentFormValues>({
    resolver: zodResolver(addAgentFormSchema),
    defaultValues: {
      name: '',
      badgeNumber: '',
      agencyId: '',
      gradeId: '',
      status: 'active',
      email: '',
      phoneNumber: '',
      discordId: '',
      address: '',
      emergencyContact: '',
      dateOfBirth: '',
      candidateId: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agenciesData, gradesData] = await Promise.all([
          getPoliceAgencies(),
          getPoliceGrades()
        ]);
        setAgencies(agenciesData);
        setAllGrades(gradesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (values: AddAgentFormValues) => {
    try {
      await createPoliceAgent({
        name: values.name,
        badgeNumber: values.badgeNumber,
        agencyId: values.agencyId,
        gradeId: values.gradeId,
        status: values.status,
        email: values.email,
        phoneNumber: values.phoneNumber,
        discordId: values.discordId,
        address: values.address,
        emergencyContact: values.emergencyContact,
        dateOfBirth: values.dateOfBirth,
        candidateId: values.candidateId,
      });
      toast({
        title: 'Succès',
        description: 'Agent ajouté avec succès.',
      });
      navigate('/police/agents');
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de l\'agent.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate('/police/agents')}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5" />
            Ajouter un agent
          </CardTitle>
          <CardDescription>
            Ajouter un nouvel agent des forces de l'ordre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'agent</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'agent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="badgeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de badge</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro de badge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agencyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une agence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            {agency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allGrades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                        <SelectItem value="retired">Retraité</SelectItem>
                        <SelectItem value="training">En formation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email de l'agent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Numéro de téléphone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discordId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discord ID</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Ex: 556455932956246028" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Adresse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact d'urgence</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Contact d'urgence" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="candidateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID du candidat</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="ID du candidat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Ajouter un agent</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddAgent;
