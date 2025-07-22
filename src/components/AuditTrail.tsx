import React, { useState, useEffect } from 'react';
import { History, User, Calendar, Edit, Trash2, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuditEntry {
  id: string;
  messageId: string;
  action: 'created' | 'updated' | 'deleted' | 'sent' | 'failed';
  userId: string;
  userName: string;
  timestamp: string;
  details: {
    oldValue?: string;
    newValue?: string;
    reason?: string;
  };
  messageText?: string;
}

interface AuditTrailProps {
  contactId?: string;
  messageId?: string;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ contactId, messageId }) => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuditTrail();
  }, [contactId, messageId]);

  useEffect(() => {
    applyFilters();
  }, [auditEntries, filterAction, filterUser, filterDate]);

  const loadAuditTrail = async () => {
    setIsLoading(true);
    
    // In real implementation, this would load from widget's internal storage or Kommo custom fields
    const mockAuditEntries: AuditEntry[] = [
      {
        id: '1',
        messageId: 'msg_1',
        action: 'created',
        userId: 'user_1',
        userName: 'Maria Santos',
        timestamp: '2024-07-22T10:30:00Z',
        details: {},
        messageText: 'Olá! Como foi sua experiência com nossa demonstração?'
      },
      {
        id: '2',
        messageId: 'msg_1',
        action: 'updated',
        userId: 'user_2',
        userName: 'João Silva',
        timestamp: '2024-07-22T14:15:00Z',
        details: {
          oldValue: 'Olá! Como foi sua experiência?',
          newValue: 'Olá! Como foi sua experiência com nossa demonstração?'
        },
        messageText: 'Olá! Como foi sua experiência com nossa demonstração?'
      },
      {
        id: '3',
        messageId: 'msg_2',
        action: 'created',
        userId: 'user_2',
        userName: 'João Silva',
        timestamp: '2024-07-21T15:45:00Z',
        details: {},
        messageText: 'Lembrete: Sua proposta expira em 48 horas.'
      },
      {
        id: '4',
        messageId: 'msg_2',
        action: 'sent',
        userId: 'system',
        userName: 'Sistema (Salesbot)',
        timestamp: '2024-07-24T09:00:00Z',
        details: { reason: 'Enviado automaticamente pelo Salesbot' },
        messageText: 'Lembrete: Sua proposta expira em 48 horas.'
      },
      {
        id: '5',
        messageId: 'msg_3',
        action: 'failed',
        userId: 'system',
        userName: 'Sistema (Salesbot)',
        timestamp: '2024-07-23T16:30:00Z',
        details: { reason: 'Erro na API do WhatsApp' },
        messageText: 'Acompanhamento da proposta'
      }
    ];

    setAuditEntries(mockAuditEntries);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = auditEntries;

    if (filterAction !== 'all') {
      filtered = filtered.filter(entry => entry.action === filterAction);
    }

    if (filterUser) {
      filtered = filtered.filter(entry => 
        entry.userName.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.toDateString() === filterDateObj.toDateString();
      });
    }

    setFilteredEntries(filtered);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4 text-widget-success" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-kommo-primary" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-widget-error" />;
      case 'sent':
        return <Calendar className="w-4 h-4 text-widget-success" />;
      case 'failed':
        return <Calendar className="w-4 h-4 text-widget-error" />;
      default:
        return <History className="w-4 h-4 text-widget-text-muted" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'created':
        return <Badge className="bg-widget-success text-white">Criada</Badge>;
      case 'updated':
        return <Badge className="bg-kommo-primary text-white">Atualizada</Badge>;
      case 'deleted':
        return <Badge className="bg-widget-error text-white">Excluída</Badge>;
      case 'sent':
        return <Badge className="bg-widget-success text-white">Enviada</Badge>;
      case 'failed':
        return <Badge className="bg-widget-error text-white">Falhou</Badge>;
      default:
        return <Badge className="bg-widget-text-muted text-white">{action}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const clearFilters = () => {
    setFilterAction('all');
    setFilterUser('');
    setFilterDate('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-widget-bg border-widget-border shadow-widget">
        <CardHeader>
          <CardTitle className="text-widget-text-primary flex items-center gap-2">
            <History className="w-5 h-5 text-kommo-primary" />
            Trilha de Auditoria
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="mb-6 p-4 bg-widget-surface rounded-lg border border-widget-border">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-widget-text-secondary" />
              <span className="font-medium text-widget-text-primary">Filtros</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="border-widget-border">
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="created">Criada</SelectItem>
                    <SelectItem value="updated">Atualizada</SelectItem>
                    <SelectItem value="deleted">Excluída</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input
                  placeholder="Filtrar por usuário"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="border-widget-border focus:border-kommo-primary"
                />
              </div>
              
              <div>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border-widget-border focus:border-kommo-primary"
                />
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full border-widget-border hover:bg-widget-hover"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {/* Audit Entries */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-widget-text-muted mx-auto mb-4" />
                <p className="text-widget-text-secondary">
                  {auditEntries.length === 0 ? 
                    'Nenhuma atividade registrada ainda.' : 
                    'Nenhuma atividade encontrada com os filtros aplicados.'
                  }
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <Card key={entry.id} className="bg-widget-surface border-widget-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getActionBadge(entry.action)}
                          <span className="text-sm text-widget-text-muted">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <p className="text-widget-text-primary">
                            <span className="font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {entry.userName}
                            </span>
                          </p>
                        </div>
                        
                        {entry.messageText && (
                          <div className="mb-2 p-2 bg-widget-bg rounded border border-widget-border">
                            <p className="text-sm text-widget-text-secondary font-medium mb-1">Mensagem:</p>
                            <p className="text-sm text-widget-text-primary italic">"{entry.messageText}"</p>
                          </div>
                        )}
                        
                        {entry.details.oldValue && entry.details.newValue && (
                          <div className="text-sm space-y-1">
                            <p className="text-widget-text-secondary">
                              <span className="font-medium">De:</span> "{entry.details.oldValue}"
                            </p>
                            <p className="text-widget-text-secondary">
                              <span className="font-medium">Para:</span> "{entry.details.newValue}"
                            </p>
                          </div>
                        )}
                        
                        {entry.details.reason && (
                          <p className="text-sm text-widget-text-muted">
                            <span className="font-medium">Detalhes:</span> {entry.details.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrail;