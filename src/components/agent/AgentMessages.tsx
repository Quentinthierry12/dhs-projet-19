
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Send,
  Inbox,
  PenTool,
  Users,
  Clock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  X,
  List
} from 'lucide-react';
import {
  getInternalMessages,
  sendInternalMessage,
  markMessageAsRead,
  getMailingLists,
  createMailingList,
  updateMailingList,
  deleteMailingList,
  getAllPoliceAgents
} from '@/lib/police-service';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentMessagesProps {
  agent: any;
}

interface RecipientTag {
  email: string;
  isFromMailingList: boolean;
}

const AgentMessages = ({ agent }: AgentMessagesProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [mailingLists, setMailingLists] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // États pour l'envoi de messages
  const [recipientTags, setRecipientTags] = useState<RecipientTag[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // États pour la gestion des listes de diffusion
  const [isMailingListDialogOpen, setIsMailingListDialogOpen] = useState(false);
  const [editingMailingList, setEditingMailingList] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<any>(null);

  const [mailingListForm, setMailingListForm] = useState({
    name: '',
    groupEmail: '',
    description: '',
    memberEmails: [] as string[]
  });

  const [memberInput, setMemberInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [agent.email]);

  const loadData = async () => {
    try {
      const [messagesData, listsData, agentsData] = await Promise.all([
        getInternalMessages(agent.email),
        getMailingLists(),
        getAllPoliceAgents()
      ]);

      setMessages(messagesData);
      setMailingLists(listsData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Gestion des tags de destinataires
  const addRecipientTag = (email: string, isFromMailingList: boolean = false) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      toast.error(`Adresse email invalide: ${trimmedEmail}`);
      return;
    }

    if (recipientTags.some(tag => tag.email === trimmedEmail)) {
      toast.error('Ce destinataire est déjà ajouté');
      return;
    }

    setRecipientTags([...recipientTags, { email: trimmedEmail, isFromMailingList }]);
    setRecipientInput('');
  };

  const removeRecipientTag = (email: string) => {
    setRecipientTags(recipientTags.filter(tag => tag.email !== email));
  };

  const handleRecipientInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && recipientInput.trim()) {
      e.preventDefault();
      addRecipientTag(recipientInput);
    }
  };

  // Ajouter une liste de diffusion comme destinataire
  const addMailingListAsRecipient = (listId: string) => {
    const list = mailingLists.find(l => l.id === listId);
    if (!list) return;

    if (list.groupEmail) {
      // Si la liste a un groupEmail, ajouter seulement ce groupEmail
      addRecipientTag(list.groupEmail, true);
    } else {
      // Sinon, ajouter tous les membres individuellement
      list.memberEmails.forEach((email: string) => {
        if (!recipientTags.some(tag => tag.email === email)) {
          setRecipientTags(prev => [...prev, { email, isFromMailingList: true }]);
        }
      });
    }
  };

  const handleSendMessage = async () => {
    if (recipientTags.length === 0) {
      toast.error('Veuillez ajouter au moins un destinataire');
      return;
    }

    if (!subject.trim() || !content.trim()) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    setIsSending(true);
    try {
      const recipientList = recipientTags.map(tag => tag.email);

      await sendInternalMessage({
        senderEmail: agent.email,
        recipientEmails: recipientList,
        subject: subject,
        content: content,
        senderId: agent.id,
      });

      toast.success('Message envoyé avec succès');
      setRecipientTags([]);
      setRecipientInput('');
      setSubject('');
      setContent('');
      loadData();
    } catch (error) {
      console.error('Erreur lors de l envoi:', error);
      toast.error('Erreur lors de l envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId, agent.email);
      loadData();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  // Gestion des listes de diffusion
  const openCreateDialog = () => {
    setEditingMailingList(null);
    setMailingListForm({
      name: '',
      groupEmail: '',
      description: '',
      memberEmails: []
    });
    setFormErrors({});
    setIsMailingListDialogOpen(true);
  };

  const openEditDialog = (list: any) => {
    setEditingMailingList(list);
    setMailingListForm({
      name: list.name,
      groupEmail: list.groupEmail || '',
      description: list.description || '',
      memberEmails: list.memberEmails
    });
    setFormErrors({});
    setIsMailingListDialogOpen(true);
  };

  const addMemberEmail = (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      setFormErrors(prev => ({ ...prev, member: `Adresse email invalide: ${trimmedEmail}` }));
      return;
    }

    if (mailingListForm.memberEmails.includes(trimmedEmail)) {
      setFormErrors(prev => ({ ...prev, member: 'Ce membre est déjà dans la liste' }));
      return;
    }

    setMailingListForm(prev => ({
      ...prev,
      memberEmails: [...prev.memberEmails, trimmedEmail]
    }));
    setMemberInput('');
    setFormErrors(prev => ({ ...prev, member: '' }));
  };

  const removeMemberEmail = (email: string) => {
    setMailingListForm(prev => ({
      ...prev,
      memberEmails: prev.memberEmails.filter(e => e !== email)
    }));
  };

  const addAgentAsMember = (agentId: string) => {
    const selectedAgent = agents.find(a => a.id === agentId);
    if (selectedAgent && selectedAgent.email) {
      addMemberEmail(selectedAgent.email);
    }
  };

  const validateMailingListForm = () => {
    const errors: Record<string, string> = {};

    if (!mailingListForm.name.trim()) {
      errors.name = 'Le nom de la liste est requis';
    } else if (mailingListForm.name.length < 2 || mailingListForm.name.length > 100) {
      errors.name = 'Le nom doit contenir entre 2 et 100 caractères';
    }

    if (mailingListForm.groupEmail && !isValidEmail(mailingListForm.groupEmail)) {
      errors.groupEmail = 'Format d\'email invalide';
    }

    if (mailingListForm.groupEmail) {
      const isDuplicate = mailingLists.some(list =>
        list.groupEmail === mailingListForm.groupEmail &&
        list.id !== editingMailingList?.id
      );
      if (isDuplicate) {
        errors.groupEmail = 'Cette adresse email est déjà utilisée par une autre liste';
      }
    }

    if (mailingListForm.description && mailingListForm.description.length > 500) {
      errors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    if (mailingListForm.memberEmails.length === 0) {
      errors.members = 'Au moins un membre est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveMailingList = async () => {
    if (!validateMailingListForm()) {
      return;
    }

    try {
      if (editingMailingList) {
        await updateMailingList(editingMailingList.id, {
          name: mailingListForm.name,
          groupEmail: mailingListForm.groupEmail || undefined,
          description: mailingListForm.description || undefined,
          memberEmails: mailingListForm.memberEmails
        });
        toast.success('Liste de diffusion mise à jour avec succès');
      } else {
        await createMailingList({
          name: mailingListForm.name,
          groupEmail: mailingListForm.groupEmail || undefined,
          description: mailingListForm.description || undefined,
          memberEmails: mailingListForm.memberEmails,
          createdBy: agent.id,
          agencyId: agent.agencyId
        });
        toast.success('Liste de diffusion créée avec succès');
      }

      setIsMailingListDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        toast.error('Cette adresse email est déjà utilisée par une autre liste');
      } else {
        toast.error('Erreur lors de la sauvegarde de la liste');
      }
    }
  };

  const confirmDeleteMailingList = (list: any) => {
    setListToDelete(list);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteMailingList = async () => {
    if (!listToDelete) return;

    try {
      await deleteMailingList(listToDelete.id);
      toast.success('Liste de diffusion supprimée avec succès');
      setDeleteConfirmOpen(false);
      setListToDelete(null);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la liste');
    }
  };

  const canEditList = (list: any) => {
    return list.createdBy === agent.id;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox" className="flex items-center space-x-2">
            <Inbox className="h-4 w-4" />
            <span>Boîte de réception</span>
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center space-x-2">
            <PenTool className="h-4 w-4" />
            <span>Nouveau message</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="mailing-lists" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Listes de diffusion</span>
          </TabsTrigger>
        </TabsList>

        {/* Inbox */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Messages reçus</span>
                <Badge variant="secondary">{messages.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement des messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun message</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        message.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => handleMarkAsRead(message.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {message.isRead ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-medium">
                              {message.senderName || message.senderEmail}
                            </span>
                            {message.senderBadge && (
                              <Badge variant="outline" className="text-xs">
                                #{message.senderBadge}
                              </Badge>
                            )}
                          </div>
                          <h4 className={`font-medium ${!message.isRead ? 'text-blue-900' : ''}`}>
                            {message.subject}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(message.sentAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PenTool className="h-5 w-5" />
                <span>Nouveau message</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Destinataires
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="Saisir une adresse email et appuyer sur Entrée"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={handleRecipientInputKeyDown}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addRecipientTag(recipientInput)}
                    disabled={!recipientInput.trim()}
                  >
                    Ajouter
                  </Button>
                  <Select onValueChange={addMailingListAsRecipient}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Listes de diffusion" />
                    </SelectTrigger>
                    <SelectContent>
                      {mailingLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name} {list.groupEmail ? `(${list.groupEmail})` : `(${list.memberEmails.length} membres)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {recipientTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {recipientTags.map((tag) => (
                      <Badge
                        key={tag.email}
                        variant="secondary"
                        className={tag.isFromMailingList ? 'bg-blue-100 hover:bg-blue-200 text-blue-900' : ''}
                      >
                        {tag.email}
                        <button
                          onClick={() => removeRecipientTag(tag.email)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Les tags bleus indiquent les destinataires provenant de listes de diffusion
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sujet</label>
                <Input
                  placeholder="Objet du message"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  placeholder="Contenu de votre message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={isSending}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{isSending ? 'Envoi...' : 'Envoyer'}</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contacts */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Agents DHS</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (contact.email) {
                        addRecipientTag(contact.email);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                        <p className="text-xs text-gray-400">#{contact.badgeNumber}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mailing Lists */}
        <TabsContent value="mailing-lists">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <List className="h-5 w-5" />
                  <span>Listes de diffusion</span>
                </CardTitle>
                <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Créer une liste</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement des listes...</p>
              ) : mailingLists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Aucune liste de diffusion. Créez votre première liste!</p>
                  <Button onClick={openCreateDialog} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Créer une liste</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mailingLists.map((list) => (
                    <Card key={list.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{list.name}</CardTitle>
                        {list.groupEmail && (
                          <p className="text-sm text-gray-500">{list.groupEmail}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        {list.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                            {list.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="secondary">
                            {list.memberEmails.length} {list.memberEmails.length === 1 ? 'membre' : 'membres'}
                          </Badge>
                        </div>

                        {canEditList(list) && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(list)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDeleteMailingList(list)}
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Créer/Modifier liste de diffusion */}
      <Dialog open={isMailingListDialogOpen} onOpenChange={setIsMailingListDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMailingList ? 'Modifier la liste de diffusion' : 'Créer une liste de diffusion'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom de la liste <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Équipe de supervision"
                value={mailingListForm.name}
                onChange={(e) => setMailingListForm(prev => ({ ...prev, name: e.target.value }))}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email du groupe (optionnel)
              </label>
              <Input
                placeholder="supervision@dhs.gov"
                value={mailingListForm.groupEmail}
                onChange={(e) => setMailingListForm(prev => ({ ...prev, groupEmail: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Adresse email optionnelle pour la liste
              </p>
              {formErrors.groupEmail && (
                <p className="text-sm text-red-500 mt-1">{formErrors.groupEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description (optionnel)
              </label>
              <Textarea
                placeholder="À quoi sert cette liste?"
                value={mailingListForm.description}
                onChange={(e) => setMailingListForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Membres <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder="Saisir un email et appuyer sur Entrée"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMemberEmail(memberInput);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addMemberEmail(memberInput)}
                  disabled={!memberInput.trim()}
                >
                  Ajouter
                </Button>
              </div>

              <Select onValueChange={addAgentAsMember}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ou sélectionner un agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents
                    .filter(a => a.email && !mailingListForm.memberEmails.includes(a.email))
                    .map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {mailingListForm.memberEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md mt-2">
                  {mailingListForm.memberEmails.map((email) => (
                    <Badge key={email} variant="secondary">
                      {email}
                      <button
                        onClick={() => removeMemberEmail(email)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1">
                Saisir manuellement ou sélectionner depuis le menu déroulant
              </p>
              {formErrors.members && (
                <p className="text-sm text-red-500 mt-1">{formErrors.members}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsMailingListDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveMailingList}>
                {editingMailingList ? 'Enregistrer les modifications' : 'Créer la liste'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la liste "{listToDelete?.name}"? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMailingList} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentMessages;
