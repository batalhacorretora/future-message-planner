import React, { useState, useEffect } from 'react';
import { Settings, Database, Zap, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface CustomField {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  status: 'configured' | 'missing' | 'error';
}

interface SalesbotConfig {
  isInstalled: boolean;
  isConfigured: boolean;
  name?: string;
  lastRun?: string;
  status: 'active' | 'inactive' | 'error';
}

const KommoIntegration: React.FC = () => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [salesbotConfig, setSalesbotConfig] = useState<SalesbotConfig>({
    isInstalled: false,
    isConfigured: false,
    status: 'inactive'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeIntegration();
  }, []);

  const initializeIntegration = async () => {
    setIsLoading(true);
    
    // Check required custom fields
    await checkCustomFields();
    
    // Check Salesbot configuration
    await checkSalesbotConfig();
    
    setIsLoading(false);
  };

  const checkCustomFields = async () => {
    // In real implementation, this would check Kommo API for existing custom fields
    const requiredFields: CustomField[] = [
      {
        id: 'mensagem_futura_texto',
        name: 'Mensagem Futura - Texto',
        type: 'text',
        isRequired: true,
        status: 'configured'
      },
      {
        id: 'mensagem_futura_data',
        name: 'Mensagem Futura - Data/Hora',
        type: 'datetime',
        isRequired: true,
        status: 'configured'
      },
      {
        id: 'mensagem_futura_status',
        name: 'Mensagem Futura - Status',
        type: 'select',
        isRequired: true,
        status: 'missing'
      },
      {
        id: 'mensagem_futura_auditoria',
        name: 'Mensagem Futura - Auditoria',
        type: 'text',
        isRequired: false,
        status: 'configured'
      }
    ];

    setCustomFields(requiredFields);
  };

  const checkSalesbotConfig = async () => {
    // In real implementation, this would check if the Salesbot is properly configured
    setSalesbotConfig({
      isInstalled: true,
      isConfigured: false,
      name: 'Mensagens Futuras Bot',
      status: 'inactive'
    });
  };

  const createMissingFields = async () => {
    // In real implementation, this would create missing custom fields via Kommo API
    const updatedFields = customFields.map(field => ({
      ...field,
      status: 'configured' as const
    }));
    
    setCustomFields(updatedFields);
  };

  const getFieldStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="w-4 h-4 text-widget-success" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-widget-warning" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-widget-error" />;
      default:
        return <Info className="w-4 h-4 text-widget-info" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge className="bg-widget-success text-white">Configurado</Badge>;
      case 'missing':
        return <Badge className="bg-widget-warning text-white">Faltando</Badge>;
      case 'error':
        return <Badge className="bg-widget-error text-white">Erro</Badge>;
      default:
        return <Badge className="bg-widget-text-muted text-white">Desconhecido</Badge>;
    }
  };

  const missingFieldsCount = customFields.filter(field => field.status !== 'configured').length;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-widget-bg border-widget-border shadow-widget">
        <CardHeader>
          <CardTitle className="text-widget-text-primary flex items-center gap-2">
            <Settings className="w-5 h-5 text-kommo-primary" />
            Configuração da Integração Kommo
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Custom Fields Configuration */}
      <Card className="bg-widget-bg border-widget-border">
        <CardHeader>
          <CardTitle className="text-widget-text-primary flex items-center gap-2">
            <Database className="w-5 h-5 text-kommo-primary" />
            Campos Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {missingFieldsCount > 0 && (
            <Alert className="mb-4 border-widget-warning bg-widget-warning/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-widget-text-primary">
                {missingFieldsCount} campo(s) personalizado(s) precisam ser criados no Kommo para o funcionamento completo do widget.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {customFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-widget-surface rounded-lg border border-widget-border">
                <div className="flex items-center gap-3">
                  {getFieldStatusIcon(field.status)}
                  <div>
                    <p className="font-medium text-widget-text-primary">{field.name}</p>
                    <p className="text-sm text-widget-text-muted">
                      Tipo: {field.type} {field.isRequired && '(Obrigatório)'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(field.status)}
              </div>
            ))}
          </div>

          {missingFieldsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-widget-border">
              <Button 
                onClick={createMissingFields}
                className="bg-kommo-primary hover:bg-kommo-primary-dark text-white"
              >
                Criar Campos Faltantes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salesbot Configuration */}
      <Card className="bg-widget-bg border-widget-border">
        <CardHeader>
          <CardTitle className="text-widget-text-primary flex items-center gap-2">
            <Zap className="w-5 h-5 text-kommo-primary" />
            Configuração do Salesbot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-widget-info bg-widget-info/10">
            <Info className="w-4 h-4" />
            <AlertDescription className="text-widget-text-primary">
              O Salesbot deve ser configurado manualmente no Kommo após a instalação do widget. 
              Ele será responsável pelo envio automático das mensagens agendadas.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-widget-surface rounded-lg border border-widget-border">
              <div>
                <p className="font-medium text-widget-text-primary">Status do Salesbot</p>
                <p className="text-sm text-widget-text-muted">
                  {salesbotConfig.name || 'Salesbot não configurado'}
                </p>
              </div>
              <Badge className={
                salesbotConfig.status === 'active' ? 'bg-widget-success text-white' :
                salesbotConfig.status === 'error' ? 'bg-widget-error text-white' :
                'bg-widget-text-muted text-white'
              }>
                {salesbotConfig.status === 'active' ? 'Ativo' :
                 salesbotConfig.status === 'error' ? 'Erro' : 'Inativo'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-widget-text-primary">Instruções para Configuração do Salesbot:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-widget-text-secondary">
                <li>Acesse a seção "Salesbots" no menu principal do Kommo</li>
                <li>Clique em "Criar novo Salesbot"</li>
                <li>Configure o trigger para monitorar mudanças nos campos personalizados criados</li>
                <li>Adicione uma ação para enviar mensagem usando o campo "Mensagem Futura - Texto"</li>
                <li>Configure a condição de tempo baseada no campo "Mensagem Futura - Data/Hora"</li>
                <li>Atualize o status para "enviado" após o envio bem-sucedido</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status Summary */}
      <Card className="bg-widget-bg border-widget-border">
        <CardHeader>
          <CardTitle className="text-widget-text-primary">Status da Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-widget-surface rounded-lg border border-widget-border">
              <div className="text-2xl font-bold text-kommo-primary mb-2">
                {customFields.filter(f => f.status === 'configured').length}/{customFields.length}
              </div>
              <p className="text-sm text-widget-text-secondary">Campos Configurados</p>
            </div>
            
            <div className="text-center p-4 bg-widget-surface rounded-lg border border-widget-border">
              <div className="text-2xl font-bold text-widget-warning mb-2">
                {salesbotConfig.isConfigured ? '1' : '0'}/1
              </div>
              <p className="text-sm text-widget-text-secondary">Salesbot Configurado</p>
            </div>
            
            <div className="text-center p-4 bg-widget-surface rounded-lg border border-widget-border">
              <div className={`text-2xl font-bold mb-2 ${
                missingFieldsCount === 0 && salesbotConfig.isConfigured ? 
                'text-widget-success' : 'text-widget-warning'
              }`}>
                {missingFieldsCount === 0 && salesbotConfig.isConfigured ? '100%' : 
                 Math.round(((customFields.length - missingFieldsCount) / (customFields.length + 1)) * 100) + '%'}
              </div>
              <p className="text-sm text-widget-text-secondary">Integração Completa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KommoIntegration;