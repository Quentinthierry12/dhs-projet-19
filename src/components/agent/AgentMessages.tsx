
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Inbox, 
  PenTool, 
  Users, 
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getInternalMessages, 
  sendInternalMessage, 
  markMessageAsRead,
  getMailingLists,
  getAllPoliceAgents
} from '@/lib/police-service';
import { toast } from 'sonner';

interface AgentMessagesProps {
  agent: any;
}

const AgentMessages = ({ agent }: AgentMessagesProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [mailingLists, setMailingLists] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour l'envoi de messages
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  const handleSendMessage = async () => {
    if (!recipients.trim() || !subject.trim() || !content.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSending(true);
    try {
      const recipientList = recipients.split(',').map(r => r.trim());
      
      await sendInternalMessage({
        senderEmail: agent.email,
        recipientEmails: recipientList,
        subject: subject,
        content: content,
        senderId: agent.id,
      });

      toast.success('Message envoyé avec succès');
      setRecipients('');
      setSubject('');
      setContent('');
      loadData(); // Recharger les messages
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
      loadData(); // Recharger les messages
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
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
                  Destinataires (séparés par des virgules)
                </label>
                <Input
                  placeholder="agent.nom@noose.gov, autre.agent@noose.gov"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: prenom.nom@noose.gov
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
                <span>Agents NOOSE</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {agents.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setRecipients(prev => 
                      prev ? `${prev}, ${contact.email}` : contact.email
                    )}
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
      </Tabs>
    </div>
  );
};

export default AgentMessages;
