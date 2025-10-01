
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { LockIcon } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  identifier: z.string().min(1, "Identifiant ou email requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Auth = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('Auth component render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Simplified redirect logic
  useEffect(() => {
    console.log('Auth useEffect - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    if (isAuthenticated && !isLoading) {
      console.log('User authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    console.log('Login form submitted with values:', values);
    try {
      const result = await login(values.identifier, values.password);
      console.log('Login result:', result);
      if (result.success) {
        toast.success("Connexion réussie");
        // Navigation will be handled by useEffect
      } else {
        toast.error(result.error || "Erreur de connexion");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Une erreur est survenue lors de la connexion");
    }
  };

  // Show loading state
  if (isLoading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-lg">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if authenticated (will redirect via useEffect)
  if (isAuthenticated) {
    console.log('User is authenticated, should redirect soon');
    return null;
  }

  console.log('Rendering login form');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 items-center text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-2">
            <LockIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder au tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifiant ou Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Saisissez votre identifiant ou email"
                        {...field}
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Saisissez votre mot de passe"
                        {...field}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
