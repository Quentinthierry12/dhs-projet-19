
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { User, getUserById, updateUser } from "@/lib/auth-service";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeftIcon, UserIcon, Save } from "lucide-react";

const userUpdateSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  identifiant: z.string().min(3, "L'identifiant doit contenir au moins 3 caractères"),
  role: z.enum(["instructeur", "direction"], {
    required_error: "Le rôle est requis",
  }),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type UserUpdateValues = z.infer<typeof userUpdateSchema>;

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDirector, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const form = useForm<UserUpdateValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      identifiant: "",
      role: "instructeur",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setIsLoadingUser(false);
        return;
      }

      try {
        console.log("Fetching user with ID:", id);
        const userData = await getUserById(id);
        console.log("Fetched user data:", userData);
        
        if (userData) {
          setUser(userData);
          form.reset({
            nom: userData.nom,
            prenom: userData.prenom,
            email: userData.email,
            identifiant: userData.identifiant,
            role: userData.role as "instructeur" | "direction",
            password: "",
            confirmPassword: ""
          });
        } else {
          toast({
            title: "Erreur",
            description: "Utilisateur non trouvé",
            variant: "destructive",
          });
          navigate("/direction/users");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations de l'utilisateur",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUser(false);
      }
    };

    // Only fetch user if we have authentication status
    if (!isLoading) {
      fetchUser();
    }
  }, [id, toast, navigate, form, isLoading]);

  const onSubmit = async (values: UserUpdateValues) => {
    if (!id || !user) return;
    
    setIsSubmitting(true);
    try {
      // Prepare data for update - only include password if it was changed
      const updateData = {
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        identifiant: values.identifiant,
        role: values.role,
        ...(values.password ? { password: values.password } : {})
      };
      
      const success = await updateUser(id, updateData);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Informations de l'utilisateur mises à jour avec succès"
        });
        navigate("/direction/users");
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour les informations de l'utilisateur",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'utilisateur",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while auth is loading
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not a director
  if (!isDirector) {
    return <Navigate to="/" replace />;
  }

  // Show loading while user data is loading
  if (isLoadingUser) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <p>Chargement des informations de l'utilisateur...</p>
        </div>
      </div>
    );
  }

  // Show error if user not found
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <p>Utilisateur non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/direction/users")}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Modifier un utilisateur
          </CardTitle>
          <CardDescription>
            Modifiez les informations de l'utilisateur: {user.prenom} {user.nom}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speudo Discord</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Speudo Discord" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identifiant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiant</FormLabel>
                      <FormControl>
                        <Input placeholder="Identifiant de connexion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Laisser vide pour ne pas changer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirmer le mot de passe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Rôle</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="instructeur" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Instructeur
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="direction" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Direction
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Modification en cours..." : "Mettre à jour l'utilisateur"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUser;
