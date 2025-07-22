import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, Send, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ScheduledMessage {
  id: string;
  text: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

interface MessageSchedulerProps {
  contactId?: string;
  location: 'lcard-1' | 'ccard-0' | 'settings';
}

const MessageScheduler: React.FC<MessageSchedulerProps> = ({ contactId, location }) => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null);
  const [messageText, setMessageText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const { toast } = useToast();

  // Mock current user - in real implementation, this would come from Kommo API
  const currentUser = 'João Silva';

  useEffect(() => {
    // Load existing messages for this contact
    loadScheduledMessages();
  }, [contactId]);

  const loadScheduledMessages = () => {
    // In real implementation, this would load from Kommo custom fields
    // For now, using mock data
    const mockMessages: ScheduledMessage[] = [
      {
        id: '1',
        text: 'Olá! Como foi sua experiência com nossa demonstração?',
        scheduledDate: '2024-07-25',
        scheduledTime: '14:30',
        status: 'scheduled',
        createdBy: 'Maria Santos',
        createdAt: '2024-07-22T10:30:00Z'
      },
      {
        id: '2',
        text: 'Lembrete: Sua proposta expira em 48 horas.',
        scheduledDate: '2024-07-24',
        scheduledTime: '09:00',
        status: 'sent',
        createdBy: 'João Silva',
        createdAt: '2024-07-21T15:45:00Z'
      }
    ];
    setMessages(mockMessages);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-status-pending text-white';
      case 'scheduled': return 'bg-status-scheduled text-white';
      case 'sent': return 'bg-status-sent text-white';
      case 'failed': return 'bg-status-failed text-white';
      case 'cancelled': return 'bg-status-cancelled text-white';
      default: return 'bg-widget-text-muted text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'scheduled': return 'Agendada';
      case 'sent': return 'Enviada';
      case 'failed': return 'Falhou';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const handleSaveMessage = () => {
    if (!messageText.trim() || !scheduledDate || !scheduledTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    // Validate that scheduled time is in the future
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast({
        title: "Data inválida",
        description: "A data e hora devem ser no futuro.",
        variant: "destructive"
      });
      return;
    }

    const messageData: ScheduledMessage = {
      id: editingMessage?.id || Date.now().toString(),
      text: messageText,
      scheduledDate,
      scheduledTime,
      status: 'scheduled',
      createdBy: editingMessage?.createdBy || currentUser,
      createdAt: editingMessage?.createdAt || new Date().toISOString(),
      lastModifiedBy: editingMessage ? currentUser : undefined,
      lastModifiedAt: editingMessage ? new Date().toISOString() : undefined
    };

    if (editingMessage) {
      setMessages(prev => prev.map(msg => msg.id === editingMessage.id ? messageData : msg));
      toast({
        title: "Mensagem atualizada",
        description: "A mensagem foi atualizada com sucesso."
      });
    } else {
      setMessages(prev => [...prev, messageData]);
      toast({
        title: "Mensagem agendada",
        description: "A mensagem foi agendada com sucesso."
      });
    }

    // In real implementation, save to Kommo custom fields here
    saveToKommoFields(messageData);

    handleCloseDialog();
  };

  const saveToKommoFields = (message: ScheduledMessage) => {
    // This function will update Kommo custom fields
    // Implementation will depend on Kommo API integration
    console.log('Saving to Kommo custom fields:', message);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({
      title: "Mensagem excluída",
      description: "A mensagem foi excluída com sucesso."
    });
  };

  const handleEditMessage = (message: ScheduledMessage) => {
    setEditingMessage(message);
    setMessageText(message.text);
    setScheduledDate(message.scheduledDate);
    setScheduledTime(message.scheduledTime);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMessage(null);
    setMessageText('');
    setScheduledDate('');
    setScheduledTime('');
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('pt-BR');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-widget-bg border-widget-border shadow-widget">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-widget-text-primary flex items-center gap-2">
              <Send className="w-5 h-5 text-kommo-primary" />
              Mensagens Futuras
            </CardTitle>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-kommo-primary hover:bg-kommo-primary-dark text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Mensagem
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {messages.length === 0 ? (
            <Alert className="border-widget-border">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-widget-text-secondary">
                Nenhuma mensagem agendada. Clique em "Nova Mensagem" para começar.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className="bg-widget-surface border-widget-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(message.status)}>
                            {getStatusText(message.status)}
                          </Badge>
                          <span className="text-sm text-widget-text-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateTime(message.scheduledDate, message.scheduledTime)}
                          </span>
                        </div>
                        
                        <p className="text-widget-text-primary mb-3">{message.text}</p>
                        
                        <div className="text-xs text-widget-text-muted space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Criado por: {message.createdBy} em {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                          {message.lastModifiedBy && (
                            <div className="flex items-center gap-1">
                              <Edit className="w-3 h-3" />
                              Modificado por: {message.lastModifiedBy} em {new Date(message.lastModifiedAt!).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {message.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMessage(message)}
                            className="border-widget-border hover:bg-widget-hover"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="border-widget-error text-widget-error hover:bg-widget-error hover:text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-widget-bg border-widget-border">
          <DialogHeader>
            <DialogTitle className="text-widget-text-primary">
              {editingMessage ? 'Editar Mensagem' : 'Nova Mensagem Agendada'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message" className="text-widget-text-primary">
                Texto da Mensagem
              </Label>
              <Textarea
                id="message"
                placeholder="Digite a mensagem que será enviada..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="mt-1 border-widget-border focus:border-kommo-primary"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-widget-text-primary">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1 border-widget-border focus:border-kommo-primary"
                />
              </div>
              
              <div>
                <Label htmlFor="time" className="text-widget-text-primary">
                  Horário
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1 border-widget-border focus:border-kommo-primary"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              className="border-widget-border hover:bg-widget-hover"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveMessage}
              className="bg-kommo-primary hover:bg-kommo-primary-dark text-white"
            >
              {editingMessage ? 'Atualizar' : 'Agendar'} Mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageScheduler;