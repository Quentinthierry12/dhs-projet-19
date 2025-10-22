import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateLong } from "@/lib/date-utils";
import { 
  User, 
  Shield, 
  BookOpen, 
  Award, 
  Settings, 
  AlertTriangle,
  LogIn,
  UserPlus,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

interface ActivityLogEntryProps {
  log: {
    id: string;
    type: string;
    author_email: string;
    role: string;
    created_at: string;
    details?: any;
  };
}

const ActivityLogEntry = ({ log }: ActivityLogEntryProps) => {
  const getActivityIcon = (type: string) => {
    if (type.includes('user')) return <User className="h-4 w-4" />;
    if (type.includes('agent')) return <Shield className="h-4 w-4" />;
    if (type.includes('training')) return <BookOpen className="h-4 w-4" />;
    if (type.includes('specialty')) return <Award className="h-4 w-4" />;
    if (type.includes('connexion') || type.includes('login')) return <LogIn className="h-4 w-4" />;
    if (type.includes('create')) return <Plus className="h-4 w-4" />;
    if (type.includes('update') || type.includes('edit')) return <Edit className="h-4 w-4" />;
    if (type.includes('delete')) return <Trash2 className="h-4 w-4" />;
    if (type.includes('system')) return <Settings className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    if (type.includes('create') || type.includes('add')) return 'bg-green-100 text-green-800';
    if (type.includes('update') || type.includes('edit')) return 'bg-blue-100 text-blue-800';
    if (type.includes('delete') || type.includes('remove')) return 'bg-red-100 text-red-800';
    if (type.includes('connexion') || type.includes('login')) return 'bg-purple-100 text-purple-800';
    if (type.includes('specialty') || type.includes('training')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActivityDescription = (type: string, details: any) => {
    const entityName = details?.entityName || details?.entityId || '';
    
    switch (type) {
      case 'connexion':
        return 'Connexion à l\'application';
      case 'agent_create':
        return `Création de l'agent ${entityName}`;
      case 'agent_update':
        return `Modification de l'agent ${entityName}`;
      case 'agent_delete':
        return `Suppression de l'agent ${entityName}`;
      case 'specialty_assign':
        return `Assignation de la spécialité ${entityName} à l'agent ${details?.metadata?.agentName}`;
      case 'specialty_remove':
        return `Retrait de la spécialité ${entityName} de l'agent ${details?.metadata?.agentName}`;
      case 'training_assign':
        return `Assignation de la formation ${entityName} à l'agent ${details?.metadata?.agentName}`;
      case 'user_create':
        return `Création de l'utilisateur ${entityName}`;
      case 'user_update':
        return `Modification de l'utilisateur ${entityName}`;
      case 'activation_utilisateur':
        return `Activation de l'utilisateur`;
      case 'desactivation_utilisateur':
        return `Désactivation de l'utilisateur`;
      default:
        return type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return null;

    const relevantDetails = {
      ...(details.entityType && { Type: details.entityType }),
      ...(details.oldValues && { 'Anciennes valeurs': details.oldValues }),
      ...(details.newValues && { 'Nouvelles valeurs': details.newValues }),
      ...(details.url && { URL: details.url }),
      ...(details.userAgent && { 'Navigateur': details.userAgent.split(' ')[0] }),
    };

    return Object.keys(relevantDetails).length > 0 ? relevantDetails : null;
  };

  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getActivityIcon(log.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getActivityColor(log.type)}>
                  {log.type}
                </Badge>
                <span className="text-sm text-gray-600">
                  par {log.author_email}
                </span>
                <Badge variant="outline" className="text-xs">
                  {log.role}
                </Badge>
              </div>
              
              <div className="text-sm font-medium mb-1">
                {getActivityDescription(log.type, log.details)}
              </div>
              
              <div className="text-xs text-gray-500">
                {formatDateLong(log.created_at)}
              </div>
              
              {log.details && formatDetails(log.details) && (
                <div className="mt-2 text-xs bg-gray-50 p-2 rounded border">
                  <div className="font-medium mb-1">Détails:</div>
                  <pre className="whitespace-pre-wrap text-xs">
                    {JSON.stringify(formatDetails(log.details), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLogEntry;
