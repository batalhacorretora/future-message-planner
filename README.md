
# Mensagens Futuras - Kommo CRM Widget

Widget para agendamento de mensagens automáticas no Kommo CRM.

## Descrição

O Widget "Mensagens Futuras" permite que SDRs agendem o envio automático de mensagens para leads/contatos em datas e horas específicas. O widget gerencia o agendamento através de uma interface intuitiva e prepara os dados para envio via Salesbot.

## Funcionalidades

### Interface Principal
- **Agendamento de Mensagens**: Interface intuitiva para agendar mensagens
- **Visualização por Lead/Contato**: Lista de mensagens específicas no sidebar
- **Página de Configurações**: Visão global de todas as mensagens agendadas
- **Edição e Exclusão**: Gerenciamento completo das mensagens agendadas

### Trilha de Auditoria
- Registro completo de todas as ações (agendamento, edição, exclusão)
- Informações de usuário e timestamp
- Histórico de alterações detalhado

### Integração com Salesbot
- Atualização automática de campos personalizados do Kommo
- Sistema de status para comunicação com Salesbot
- Polling automático para identificar mensagens prontas para envio

## Estrutura Técnica

### Tecnologias Utilizadas
- **JavaScript (ES5)** com jQuery
- **Twig.js** para templates
- **CSS3** para estilização
- **Kommo Widget API** para integração

### Arquitetura
```
mensagens-futuras-widget/
├── manifest.json              # Configurações do widget
├── widget/
│   ├── script.js             # Lógica principal
│   ├── styles.css            # Estilos
│   ├── i18n/                 # Arquivos de localização
│   │   ├── pt.json           # Português
│   │   ├── es.json           # Espanhol
│   │   └── en.json           # Inglês
│   └── templates/            # Templates Twig
│       ├── widget.twig       # Template do sidebar
│       ├── schedule_modal.twig # Modal de agendamento
│       └── settings_page.twig # Página de configurações
└── README.md
```

### Localização

O widget possui suporte para múltiplos idiomas:
- **lcard-1**: Sidebar do Lead
- **ccard-0**: Sidebar do Contato  
- **settings**: Página de configurações

### Campos Personalizados

Para integração com Salesbot, o widget utiliza os seguintes campos personalizados:
- `Mensagem Agendada - Texto` (Text Area)
- `Mensagem Agendada - Data/Hora Envio` (Date & Time)
- `Mensagem Agendada - Status` (Dropdown: 'Agendada', 'Para Enviar', 'Enviada', 'Erro no Envio', 'Cancelada')

### Status de Mensagens

- **Agendada**: Mensagem criada e aguardando horário de envio
- **Para Enviar**: Horário atingido, pronta para o Salesbot processar
- **Enviada**: Mensagem enviada com sucesso pelo Salesbot
- **Erro no Envio**: Falha no envio pelo Salesbot
- **Cancelada**: Mensagem cancelada pelo usuário

## Instalação

1. Faça upload dos arquivos do widget para o Kommo
2. Configure os campos personalizados necessários
3. Ative o widget nas localizações desejadas
4. Configure o Salesbot para monitorar os campos personalizados

## Configuração do Salesbot

O Salesbot deve ser configurado para:
1. Monitorar o campo "Mensagem Agendada - Status"
2. Ativar quando o status for "Para Enviar"
3. Enviar a mensagem do campo "Mensagem Agendada - Texto"
4. Atualizar o status para "Enviada" ou "Erro no Envio"

## Segurança e Permissões

- Validação de formulários no frontend
- Verificação de permissões do usuário
- Sanitização de dados antes do armazenamento
- Logs de auditoria para rastreabilidade

## Suporte

Para suporte técnico, entre em contato através dos canais oficiais do Kommo ou consulte a documentação da API de Widgets.
