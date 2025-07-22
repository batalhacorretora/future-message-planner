import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageScheduler from '@/components/MessageScheduler';
import KommoIntegration from '@/components/KommoIntegration';
import AuditTrail from '@/components/AuditTrail';

const Index = () => {
  const [activeTab, setActiveTab] = useState('scheduler');

  return (
    <div className="min-h-screen bg-widget-bg">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-widget-text-primary mb-2">
            Mensagens Futuras - Kommo CRM Widget
          </h1>
          <p className="text-widget-text-secondary">
            Agende e gerencie mensagens automáticas para seus leads e contatos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-widget-surface border border-widget-border">
            <TabsTrigger 
              value="scheduler" 
              className="data-[state=active]:bg-kommo-primary data-[state=active]:text-white"
            >
              Agendamento
            </TabsTrigger>
            <TabsTrigger 
              value="integration"
              className="data-[state=active]:bg-kommo-primary data-[state=active]:text-white"
            >
              Integração
            </TabsTrigger>
            <TabsTrigger 
              value="audit"
              className="data-[state=active]:bg-kommo-primary data-[state=active]:text-white"
            >
              Auditoria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduler" className="mt-6">
            <MessageScheduler location="settings" />
          </TabsContent>

          <TabsContent value="integration" className="mt-6">
            <KommoIntegration />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
