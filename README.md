
# Mensagens Futuras - Kommo CRM Widget

Widget para agendamento de mensagens automáticas no Kommo CRM.

## Descrição

O Widget "Mensagens Futuras" permite que SDRs agendem o envio automático de mensagens para leads/contatos em datas e horas específicas. O widget gerencia o agendamento através de uma interface intuitiva e prepara os dados para envio via Salesbot.

## Estrutura do Projeto

```
mensagens-futuras-widget/
├── manifest.json              # Configurações principais do widget
├── i18n/                      # Arquivos de localização (root level)
│   ├── pt.json               # Português (Brasil)
│   ├── es.json               # Espanhol
│   └── en.json               # Inglês
├── images/                    # Imagens obrigatórias do widget
│   ├── logo.png              # Logo principal
│   ├── slideshow_1_en.jpg    # Imagem tour 1 (Inglês)
│   ├── slideshow_1_es.jpg    # Imagem tour 1 (Espanhol)
│   ├── slideshow_1_pt.jpg    # Imagem tour 1 (Português)
│   ├── slideshow_2_en.jpg    # Imagem tour 2 (Inglês)
│   ├── slideshow_2_es.jpg    # Imagem tour 2 (Espanhol)
│   ├── slideshow_2_pt.jpg    # Imagem tour 2 (Português)
│   ├── slideshow_3_en.jpg    # Imagem tour 3 (Inglês)
│   ├── slideshow_3_es.jpg    # Imagem tour 3 (Espanhol)
│   └── slideshow_3_pt.jpg    # Imagem tour 3 (Português)
└── widget/                    # Lógica principal do widget
    ├── script.js             # JavaScript principal
    ├── styles.css            # Estilos CSS
    └── templates/            # Templates Twig
        ├── widget.twig       # Template do sidebar
        ├── schedule_modal.twig # Modal de agendamento
        └── settings_page.twig # Página de configurações
```

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

## Tecnologias Utilizadas
- **JavaScript (ES5)** com jQuery
- **Twig.js** para templates
- **CSS3** para estilização
- **Kommo Widget API** para integração

## Localização

O widget possui suporte para múltiplos idiomas:
- **Português (pt)**: Idioma principal
- **Espanhol (es)**: Idioma secundário
- **Inglês (en)**: Idioma de fallback

## Localizações no Kommo

- **lcard-1**: Sidebar do Lead
- **ccard-0**: Sidebar do Contato  
- **settings**: Página de configurações

## Campos Personalizados

Para integração com Salesbot, o widget utiliza os seguintes campos personalizados:
- `Mensagem Agendada - Texto` (Text Area)
- `Mensagem Agendada - Data/Hora Envio` (Date & Time)
- `Mensagem Agendada - Status` (Dropdown: 'Agendada', 'Para Enviar', 'Enviada', 'Erro no Envio', 'Cancelada')

## Status de Mensagens

- **Agendada**: Mensagem criada e aguardando horário de envio
- **Para Enviar**: Horário atingido, pronta para o Salesbot processar
- **Enviada**: Mensagem enviada com sucesso pelo Salesbot
- **Erro no Envio**: Falha no envio pelo Salesbot
- **Cancelada**: Mensagem cancelada pelo usuário

## Instalação no Kommo

### Preparação do Pacote

1. **Estrutura de Arquivos**: Certifique-se de que todos os arquivos estão na estrutura correta
2. **Imagens Obrigatórias**: Todas as imagens da pasta `images/` devem existir
3. **Tradução Completa**: Todos os arquivos de i18n devem estar completos

### Criação do Pacote .ZIP

1. Vá para a pasta raiz do projeto
2. Selecione APENAS estes itens:
   - `manifest.json`
   - Pasta `i18n/`
   - Pasta `images/`
   - Pasta `widget/`
3. Comprima em um arquivo .zip
4. Faça upload no Kommo CRM

### Configuração Pós-Instalação

1. Configure os campos personalizados necessários
2. Ative o widget nas localizações desejadas
3. Configure o Salesbot para monitorar os campos personalizados

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

## Conformidade com Kommo

Este widget foi desenvolvido seguindo rigorosamente as especificações do Kommo CRM:
- **Estrutura de arquivo**: Compatível com o sistema de upload do Kommo
- **Manifest schema**: Segue o formato exato esperado pelo Kommo
- **Localização**: Implementa o sistema de tradução do Kommo
- **API Integration**: Utiliza as APIs nativas do Kommo para integração

## Suporte

Para suporte técnico, entre em contato através dos canais oficiais do Kommo ou consulte a documentação da API de Widgets.

## Versão

- **Versão Atual**: 1.0.0
- **Interface Version**: 2
- **Compatibilidade**: Kommo CRM (interface_version 2)
