
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  identifiant: string;
  role: "instructeur" | "direction";
  createdAt: string;
  lastLogin?: string;
  active: boolean;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Sign in a user with identifier and password
 */
export const signIn = async (identifier: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Use a direct SQL RPC call to avoid RLS policies that might cause recursive issues
    const { data, error } = await supabase.rpc('dhs_authenticate_user', {
      p_identifier: identifier,
      p_password: password
    });
    
    if (error || !data || data.length === 0) {
      console.error("Error authenticating user:", error);
      return { user: null, error: "Identifiant ou mot de passe incorrect" };
    }
    
    const userData = data[0];
    
    // Update last login
    const now = new Date().toISOString();
    await supabase.rpc('dhs_update_user_last_login', { 
      user_id: userData.id,
      login_time: now 
    });

    // Log the login activity
    await supabase.rpc("dhs_log_activity", {
      activity_type: "connexion",
      author_email: userData.email,
      author_role: userData.role,
      activity_details: { ip: "client-side" }
    });

    const user: User = {
      id: userData.id,
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      identifiant: userData.identifiant,
      role: userData.role as "instructeur" | "direction",
      createdAt: userData.created_at,
      lastLogin: userData.last_login,
      active: userData.active
    };

    // Store user in local storage for persistent login
    localStorage.setItem("auth_user", JSON.stringify(user));

    return { user, error: null };
  } catch (error) {
    console.error("Error during sign in:", error);
    return { user: null, error: "Une erreur est survenue lors de la connexion" };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  localStorage.removeItem("auth_user");
};

/**
 * Check if a user is currently logged in
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) return null;
    
    // Parse stored user
    const user: User = JSON.parse(storedUser);
    
    // Verify if user is still active in the database using an RPC call to avoid RLS issues
    const { data, error } = await supabase.rpc('dhs_check_user_active', {
      p_user_id: user.id
    });
    
    // If user is not found or is inactive, sign them out
    if (error || !data) {
      await signOut();
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Create a new user (instructeur only, by direction)
 */
export const createUser = async (
  userData: Omit<User, "id" | "createdAt" | "lastLogin" | "active">,
  password: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from("dhs_users")
      .select("id")
      .or(`email.eq.${userData.email},identifiant.eq.${userData.identifiant}`)
      .single();
    
    if (existingUser) {
      return { 
        success: false, 
        error: "Un utilisateur avec cet email ou cet identifiant existe déjà" 
      };
    }
    
    // Create new user with plain text password
    const { data, error } = await supabase
      .from("dhs_users")
      .insert({
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        identifiant: userData.identifiant,
        password: password,
        role: userData.role
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating user:", error);
      return { success: false, error: "Erreur lors de la création de l'utilisateur" };
    }
    
    // Log the user creation
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await supabase.rpc("dhs_log_activity", {
        activity_type: "creation_utilisateur",
        author_email: currentUser.email,
        author_role: currentUser.role,
        activity_details: { created_user: userData.email, role: userData.role }
      });
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Get all users (direction role only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from("dhs_users")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }
    
    return data.map(user => ({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      identifiant: user.identifiant,
      role: user.role as "instructeur" | "direction",
      createdAt: user.created_at,
      lastLogin: user.last_login,
      active: user.active
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

/**
 * Update user active status (enable/disable account)
 */
export const updateUserActiveStatus = async (
  userId: string,
  active: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("dhs_users")
      .update({ active })
      .eq("id", userId);
    
    if (error) {
      console.error("Error updating user status:", error);
      return false;
    }
    
    // Log the user status update
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await supabase.rpc("dhs_log_activity", {
        activity_type: active ? "activation_utilisateur" : "desactivation_utilisateur",
        author_email: currentUser.email,
        author_role: currentUser.role,
        activity_details: { target_user_id: userId, new_status: active }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    return false;
  }
};

/**
 * Get activity logs (direction role only)
 */
export interface ActivityLog {
  id: string;
  type: string;
  authorId?: string;
  authorEmail: string;
  role: string;
  createdAt: string;
  details: any;
}

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const { data, error } = await supabase
      .from("dhs_activity_logs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching activity logs:", error);
      return [];
    }
    
    return data.map(log => ({
      id: log.id,
      type: log.type,
      authorId: log.author_id,
      authorEmail: log.author_email,
      role: log.role,
      createdAt: log.created_at,
      details: log.details
    }));
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
};

// Ajout d'une fonction pour récupérer un utilisateur par ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('dhs_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      identifiant: data.identifiant,
      role: data.role as "instructeur" | "direction",
      active: data.active,
      createdAt: data.created_at,
      lastLogin: data.last_login
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

// Ajout d'une fonction pour mettre à jour un utilisateur
export const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    // Préparation des données
    const updateData: any = {
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      identifiant: userData.identifiant,
      role: userData.role,
    };
    
    // Ajouter le mot de passe seulement s'il est fourni
    if (userData.password) {
      updateData.password = userData.password;
    }
    
    const { error } = await supabase
      .from('dhs_users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    // Enregistrement de l'activité
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await supabase.rpc("dhs_log_activity", {
        activity_type: 'update_user',
        author_email: currentUser.email,
        author_role: currentUser.role,
        activity_details: {
          targetUserId: userId,
          updateFields: Object.keys(updateData).filter(field => field !== 'password')
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};
