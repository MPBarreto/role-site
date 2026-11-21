export const tutorialUserSections = [
  {
    id: 'primeiro-acesso',
    nav: 'Começar',
    number: '01',
    eyebrow: 'Primeiro acesso',
    title: 'Entre, crie sua conta ou explore.',
    intro: 'A tela inicial oferece três caminhos. Para apenas consultar os eventos, escolha “Explorar rolês sem entrar”.',
    screens: [
      {
        id: 'boas-vindas',
        title: 'Escolha como começar',
        description: 'Na tela de boas-vindas, você pode criar uma conta, entrar numa conta existente ou seguir para os eventos sem autenticar.',
        image: '/assets/tutorial/matchie/screens/matchie-welcome.jpg',
        imageAlt: 'Tela de boas-vindas do Matchie com opções para criar conta, entrar ou explorar rolês sem entrar.',
        actions: ['Criar conta', 'Entrar', 'Explorar rolês sem entrar'],
        tip: 'Ao continuar com a compra, a seleção de ingressos fica guardada enquanto você acessa ou cria sua conta.'
      },
      {
        id: 'cadastro',
        title: 'Comece seu cadastro',
        description: 'O cadastro pede nome, e-mail, data de nascimento, documento oficial e senha. O celular é opcional; escolha também como prefere informar o gênero.',
        image: '/assets/tutorial/matchie/screens/matchie-signup-empty.jpg',
        imageAlt: 'Formulário vazio de criação de conta do Matchie, sem dados pessoais preenchidos.',
        actions: ['Preencher dados da conta', 'Escolher CPF ou passaporte', 'Consultar os Termos e a Política de Privacidade'],
        tip: 'A captura mostra o formulário vazio. Nenhum dado pessoal foi inserido ou enviado.'
      },
      {
        id: 'login',
        title: 'Acesse sua conta',
        description: 'Informe e-mail e senha para entrar. Se necessário, use a recuperação de senha.',
        image: '/assets/tutorial/matchie/screens/matchie-login.jpg',
        imageAlt: 'Tela de login do Matchie com campos vazios de e-mail e senha.',
        actions: ['Entrar', 'Mostrar ou ocultar senha', 'Recuperar senha'],
        tip: 'O botão de código por e-mail aparece indisponível nessa tela da captura.'
      }
    ]
  },
  {
    id: 'descobrir-eventos',
    nav: 'Eventos',
    number: '02',
    eyebrow: 'Descobrir',
    title: 'Encontre um evento com a sua cara.',
    intro: 'A lista pública reúne shows e festas. Use cidade e datas para filtrar; cada resultado mostra informações básicas e disponibilidade de ingresso.',
    screens: [
      {
        id: 'lista-eventos',
        title: 'Explore a lista de eventos',
        description: 'Filtre por cidade, escolha Hoje, Amanhã ou Fim de semana, ou abra os filtros para refinar a busca. Toque num evento para conhecer os detalhes.',
        image: '/assets/tutorial/matchie/screens/matchie-events.png',
        imageAlt: 'Lista de eventos no Matchie com filtros e eventos em destaque.',
        imageWidth: 863,
        imageHeight: 1822,
        actions: ['Selecionar cidade', 'Filtrar por data', 'Abrir filtros', 'Ver evento'],
        tip: 'Preços e informações finais são confirmados pelo produtor do evento.'
      }
    ]
  },
  {
    id: 'detalhes-e-ingressos',
    nav: 'Detalhes e ingressos',
    number: '03',
    eyebrow: 'Escolher',
    title: 'Confira a noite antes de decidir.',
    intro: 'Cada evento reúne local, horário, descrição, ingresso disponível e políticas relevantes para sua compra.',
    screens: [
      {
        id: 'detalhe-evento',
        title: 'Leia os detalhes do evento',
        description: 'Na aba Sobre, confira data, horário, endereço, descrição e line-up. O botão Ver ingressos leva à escolha do lote.',
        image: '/assets/tutorial/matchie/screens/matchie-event-overview.jpg',
        imageAlt: 'Detalhe real do evento QUARTA-JAZZ com data, local, descrição e botão para ver ingressos.',
        actions: ['Compartilhar evento', 'Ver local no mapa', 'Abrir política de cancelamento e transferência', 'Ver ingressos'],
        tip: 'O exemplo desta captura é o QUARTA-JAZZ, em Salvador; horários, valores e regras variam por evento.'
      },
      {
        id: 'quem-vai',
        title: 'Veja a área “Quem vai”',
        description: 'A disponibilidade dos perfis depende da liberação social feita pela produção e dos requisitos de ingresso do evento.',
        image: '/assets/tutorial/matchie/screens/matchie-event-attendees.png',
        imageAlt: 'Detalhes do evento com a aba Quem vai selecionada, perfis de participantes e opções de conexão.',
        imageWidth: 863,
        imageHeight: 1822,
        actions: ['Consultar o estado do modo social', 'Voltar a Sobre ou Ingressos'],
        tip: 'Neste evento, a produção ainda não liberou o modo social. Quando aberto, os perfis ficam disponíveis a participantes com ingresso confirmado.'
      },
      {
        id: 'selecao-ingressos',
        title: 'Escolha ingresso e quantidade',
        description: 'Confira o valor e a descrição do ingresso, ajuste a quantidade e veja subtotal, taxa Matchie e total antes de continuar.',
        image: '/assets/tutorial/matchie/screens/matchie-event-tickets.jpg',
        imageAlt: 'Seleção de ingresso único com quantidade um, cupom, subtotal, taxa Matchie e total.',
        actions: ['Ajustar quantidade', 'Aplicar cupom', 'Revisar cancelamento e transferência', 'Continuar compra'],
        tip: 'A captura mostra R$ 50,00 de ingresso, R$ 5,00 de taxa e total de R$ 55,00 para este evento. O valor pode mudar.'
      },
      {
        id: 'acesso-compra',
        title: 'Continue a compra com sua conta',
        description: 'Antes do checkout, entre ou crie sua conta. O Matchie informa que os ingressos selecionados ficam guardados durante essa etapa.',
        image: '/assets/tutorial/matchie/screens/matchie-purchase-login-gate.jpg',
        imageAlt: 'Tela do Matchie que pede entrada ou criação de conta para continuar a compra e informa que os ingressos selecionados ficam guardados.',
        actions: ['Criar conta', 'Entrar', 'Explorar rolês sem entrar'],
        tip: 'Este guia para no acesso: nenhuma compra ou pagamento foi concluído.'
      }
    ]
  },
  {
    id: 'tickets',
    nav: 'Tickets',
    number: '04',
    eyebrow: 'Depois da compra',
    title: 'Acompanhe seus ingressos na carteira.',
    intro: 'Os tickets ficam na conta depois da confirmação do pagamento. A carteira separa os próximos eventos, os passados e os cancelados.',
    screens: [
      {
        id: 'carteira-de-tickets',
        title: 'Consulte seus tickets',
        description: 'Na carteira, confira os ingressos por situação. Quando houver um ingresso confirmado, abra-o para consultar os dados do pedido e as informações de entrada disponíveis.',
        image: '/assets/telas/ingresso/igresso-5.webp',
        imageAlt: 'Tela Meus ingressos do Matchie, com abas Próximos, Passados e Cancelados e uma mensagem de que os ingressos aparecem após a confirmação do pagamento.',
        actions: ['Ver próximos ingressos', 'Consultar passados', 'Ver cancelados'],
        tip: 'Esta conta de demonstração não tem pedidos; por isso a captura mostra a carteira vazia. Nenhuma compra foi realizada para este guia.',
        captureLabel: 'Conta de demonstração · iPhone 16 emulado'
      }
    ]
  },
  {
    id: 'deslizar',
    nav: 'Deslizar',
    number: '05',
    eyebrow: 'Conhecer pessoas',
    title: 'Descubra quem vai aos mesmos rolês.',
    intro: 'Com o modo social disponível no evento, a área Deslizar apresenta perfis de participantes elegíveis para que você escolha se quer demonstrar interesse.',
    screens: [
      {
        id: 'deslizar-e-acender',
        title: 'Demonstre interesse no seu ritmo',
        description: 'A tela reúne perfis ligados aos eventos elegíveis. Use os controles para passar por um perfil ou demonstrar interesse com Acender.',
        image: '/assets/telas/deslizar.webp',
        imageAlt: 'Estado vazio do Deslizar no Matchie, com uma mensagem sobre encontrar participantes dos mesmos eventos e botão para encontrar um evento.',
        actions: ['Filtrar por evento', 'Abrir um perfil', 'Apagar ou passar', 'Acender para demonstrar interesse'],
        tip: 'É preciso ter um ingresso elegível e o modo social liberado para o evento. A captura mostra o estado sem participantes disponíveis.',
        captureLabel: 'Conta de demonstração · iPhone 16 emulado'
      }
    ]
  },
  {
    id: 'matches',
    nav: 'Match',
    number: '06',
    eyebrow: 'Interesse mútuo',
    title: 'O Match acontece quando o interesse é recíproco.',
    intro: 'Quando duas pessoas demonstram interesse uma pela outra no contexto de um evento, o Matchie registra o match e abre caminho para conversar.',
    screens: [
      {
        id: 'lista-de-matches',
        title: 'Encontre seus matches',
        description: 'A aba Matches reúne as conexões confirmadas. Toque na foto para abrir o perfil e iniciar uma conversa.',
        image: '/assets/telas/Match/matches.webp',
        imageAlt: 'Aba Matches do Matchie no estado vazio, explicando que o match surge com interesse mútuo e oferecendo um atalho para Deslizar.',
        actions: ['Ver matches confirmados', 'Buscar por pessoa ou evento', 'Abrir perfil ou conversa'],
        tip: 'Sem interesse mútuo, a lista permanece vazia. O botão Deslizar leva de volta à descoberta de participantes.',
        captureLabel: 'Conta de demonstração · iPhone 16 emulado'
      }
    ]
  },
  {
    id: 'chat',
    nav: 'Chat',
    number: '07',
    eyebrow: 'Conversar',
    title: 'Continue a conexão antes do próximo rolê.',
    intro: 'As conversas aparecem depois de um match. Use o chat para trocar mensagens e combinar detalhes com a outra pessoa.',
    screens: [
      {
        id: 'lista-de-conversas',
        title: 'Abra suas conversas',
        description: 'A lista reúne as conversas iniciadas a partir de matches. Ao abrir uma conversa, você pode enviar mensagens e consultar as informações disponíveis do evento.',
        image: '/assets/telas/chat/chat-1.webp',
        imageAlt: 'Aba Chat do Matchie no estado vazio, com a mensagem de que uma conversa fica disponível após interesse mútuo no mesmo rolê.',
        actions: ['Ver conversas', 'Abrir mensagens', 'Consultar informações do rolê'],
        tip: 'É necessário um match relacionado ao mesmo evento para iniciar uma conversa. Esta captura não contém mensagens ou perfis.',
        captureLabel: 'Conta de demonstração · iPhone 16 emulado'
      }
    ]
  },
  {
    id: 'perfil-configuracoes',
    nav: 'Perfil e ajustes',
    number: '08',
    eyebrow: 'Sua conta',
    title: 'Mantenha seus dados e preferências em dia.',
    intro: 'Na aba Perfil, atualize sua apresentação e encontre atalhos para tickets, pagamentos, notificações, privacidade, segurança e suporte.',
    screens: [],
    details: {
      title: 'Atalhos da conta',
      description: 'As opções de conta ficam distribuídas em áreas próprias; não existe uma tela única chamada Configurações. Edite seu perfil, revise quem pode ver você e acesse os controles de segurança quando precisar.',
      actions: ['Editar dados e fotos', 'Gerenciar tickets e pagamentos', 'Ajustar privacidade e notificações', 'Abrir segurança e suporte'],
      tip: 'A visibilidade do perfil e as opções sociais dependem das preferências escolhidas para cada evento.'
    }
  },
  {
    id: 'notificacoes',
    nav: 'Notificações',
    number: '09',
    eyebrow: 'Ficar por dentro',
    title: 'Escolha como receber novidades.',
    intro: 'A central de notificações separa avisos de matches, chats, eventos e segurança. Nas preferências, ajuste como e quando o app pode avisar você.',
    screens: [
      {
        id: 'preferencias-notificacoes',
        title: 'Ajuste as notificações',
        description: 'Configure push, prévia na tela bloqueada, som, vibração, badges, resumo por e-mail, modo silencioso e categorias de avisos.',
        image: '/assets/tutorial/matchie/screens/matchie-notification-preferences-iphone16.png',
        imageAlt: 'Tela Preferências de notificações do Matchie com opções de push, prévia, som, vibração, resumo por e-mail, modo silencioso e categorias.',
        actions: ['Ativar ou desativar push', 'Ajustar som e prévia', 'Definir modo silencioso', 'Escolher categorias'],
        tip: 'A opção de push também depende da permissão de notificações do dispositivo. Os valores visíveis na captura são os da conta de demonstração.',
        captureLabel: 'Conta de demonstração · iPhone 16 emulado'
      }
    ]
  },
  {
    id: 'seguranca',
    nav: 'Segurança',
    number: '10',
    eyebrow: 'Conta protegida',
    title: 'Encontre ajuda e recursos de segurança.',
    intro: 'A área Segurança reúne atalhos para proteção da conta e uma central com orientações sobre acesso, privacidade, denúncias e encontros seguros.',
    screens: [
      {
        id: 'central-seguranca',
        title: 'Use a Central de segurança',
        description: 'A central reúne atalhos de ajuda para login e recuperação de conta, privacidade, assédio e golpes, além de guias de bloqueio, denúncia e encontros seguros.',
        image: '/assets/tutorial/matchie/screens/matchie-security-center-iphone16.png',
        imageAlt: 'Central de segurança do Matchie, com acesso rápido a ajuda de login, recuperação de conta, privacidade, combate a assédio, golpes e suporte.',
        actions: ['Consultar ajuda de login', 'Recuperar a conta', 'Aprender a bloquear ou denunciar', 'Falar com o suporte'],
        tip: 'Na tela Segurança da conta também há opções de autenticação em duas etapas, dispositivos e sessões. Revise-as sem compartilhar códigos de acesso.',
        captureLabel: 'Conta autenticada · iPhone 16 emulado'
      }
    ]
  },
  {
    id: 'configuracoes',
    nav: 'Configurações',
    number: '11',
    eyebrow: 'Preferências da conta',
    title: 'Ajuste como você aparece e interage.',
    intro: 'Os controles da conta ficam organizados por área. Em Privacidade, revise sua visibilidade, as regras de interação, os bloqueios e o uso dos dados.',
    screens: [
      {
        id: 'ajustes-de-privacidade',
        title: 'Revise suas configurações de privacidade',
        description: 'A área Privacidade reúne opções para escolher quem encontra seu perfil, quando conexões e conversas ficam disponíveis, além de gerenciar pessoas bloqueadas e permissões de dados.',
        image: '/assets/tutorial/matchie/screens/matchie-privacy-settings-iphone16.png',
        imageAlt: 'Tela Privacidade do Matchie com atalhos para visibilidade do perfil, regras de interação, pessoas bloqueadas e dados e permissões.',
        actions: ['Definir visibilidade do perfil', 'Consultar regras de interação', 'Gerenciar pessoas bloqueadas', 'Revisar dados e permissões'],
        tip: 'A visibilidade no Deslizar depende também de um ingresso elegível e da liberação social do evento.',
        captureLabel: 'Conta autenticada · iPhone 16 emulado'
      }
    ]
  }
];

export const tutorialProducerSections = [
  {
    id: 'produtor-cadastro',
    nav: 'Cadastro da organização',
    number: '01',
    eyebrow: 'Começar como produtor',
    title: 'Cadastre a organização responsável pelos eventos.',
    intro: 'No perfil do app, abra Atalhos da conta e escolha “Seja produtor”. Envie os dados da casa ou produtora para análise da equipe Matchie. A mini bio e a logo ajudam a apresentar a organização; os campos legais e de contato identificam quem responde por ela.',
    formPreview: {
      title: 'Organização',
      subtitle: 'Dados da casa de show',
      logo: 'Logo · JPG ou PNG · até 2 MB',
      fields: [
        { label: 'Razão social', placeholder: 'Nome registrado da empresa' },
        { label: 'CNPJ', placeholder: '00.000.000/0000-00' },
        { label: 'Endereço da empresa', placeholder: 'Rua, número, cidade e CEP' },
        { label: 'Mini bio da casa de show', placeholder: 'Conte sobre a casa, os eventos e a experiência.', multiline: true },
        { label: 'Nome completo', placeholder: 'Nome do responsável' },
        { label: 'E-mail', placeholder: 'responsavel@empresa.com' },
        { label: 'Telefone', placeholder: '(00) 00000-0000' }
      ]
    },
    screens: [
      {
        id: 'formulario-organizacao',
        title: 'O que separar antes de enviar',
        description: 'O formulário reúne identificação legal da organização, endereço e contato do responsável. A mini bio é limitada a 280 caracteres. A prévia ao lado representa os campos reais do app, sem dados preenchidos.',
        preview: 'organization-form',
        actions: ['Razão social e CNPJ', 'Endereço da empresa', 'Mini bio opcional · até 280 caracteres', 'Nome, e-mail e telefone do responsável legal'],
        tip: 'Os dados legais ficam restritos à organização e à análise administrativa da candidatura, conforme informado na tela do app.',
        captureLabel: 'Prévia dos campos reais · sem dados pessoais'
      }
    ],
    details: {
      title: 'Acompanhe a análise no mesmo cadastro',
      description: 'Depois do envio, a tela informa se a candidatura foi enviada, está em análise, precisa de informações adicionais, foi aprovada ou não foi aprovada. Quando a equipe pedir ajustes, os campos solicitados ficam destacados para uma nova versão.',
      actions: ['Conferir o status da candidatura', 'Revisar os campos solicitados', 'Enviar a atualização pelo app'],
      tip: 'A aprovação da organização pelo Matchie vem antes da configuração da conta Stripe. São etapas distintas.'
    }
  },
  {
    id: 'produtor-painel',
    nav: 'Painel após aprovação',
    number: '02',
    eyebrow: 'Organização aprovada',
    title: 'Entre no painel e prepare a operação.',
    intro: 'Com a organização aprovada, o app libera a área do produtor. O painel reúne a visão geral, eventos, financeiro, público e ajustes. Use as telas abaixo para acompanhar a rotina e entender o que cada área permite fazer.',
    screens: [
      {
        id: 'painel-atalhos',
        title: 'Visão geral da operação',
        description: 'A tela inicial resume vendas, ingressos e pedidos no período selecionado, mostra os próximos eventos e reúne atalhos para criar evento, compartilhar, abrir check-in e consultar repasses. Os dados variam por organização; os valores desta captura foram ocultados.',
        image: '/assets/tutorial/producer/screens/producer-overview-portrait.png',
        imageAlt: 'Captura retrato do painel autenticado do produtor com filtros de período, indicadores, ações rápidas e próximos eventos; valores e nome da organização foram ocultados.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Trocar o período entre 7, 30 ou 90 dias, ou ver tudo', 'Conferir indicadores gerais e próximos eventos', 'Criar evento ou compartilhar um link', 'Abrir a operação de check-in', 'Consultar repasses no Financeiro'],
        tip: 'Os atalhos economizam etapas; para analisar um evento específico, abra-o pela aba Eventos.',
        captureLabel: 'Tela autenticada · identificação e valores ocultados'
      },
      {
        id: 'eventos-do-produtor',
        title: 'Organize os eventos da casa',
        description: 'A tela Eventos separa próximos eventos, rascunhos e encerrados. Busque pelo evento e abra-o para editar, compartilhar, administrar cupons ou acompanhar pedidos.',
        image: '/assets/tutorial/producer/screens/producer-events-portrait.png',
        imageAlt: 'Tela retrato autenticada de Eventos com criação, filtros por situação, busca e um evento publicado; nome e valores foram ocultados.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Criar evento · iniciar um novo cadastro', 'Próximos · acompanhar eventos ativos', 'Rascunhos · retomar eventos ainda não publicados', 'Encerrados · consultar eventos passados', 'Buscar evento · localizar e abrir ações'],
        tip: 'Antes de publicar, revise data, local, lotes, capacidade e informações que serão exibidas ao público.',
        captureLabel: 'Eventos autenticados · nome e dados financeiros ocultados'
      },
      {
        id: 'cadastro-de-evento',
        title: 'Crie o evento em cinco etapas',
        description: 'Em Eventos, toque em Criar evento. A primeira etapa reúne a capa, o nome, a categoria, a descrição e as informações de line-up e vibe. Depois, avance por Data e local, Ingressos, Modo social e Revisão. A captura mostra a primeira etapa vazia; nada foi publicado.',
        image: '/assets/tutorial/producer/screens/producer-event-editor-portrait.png',
        imageAlt: 'Tela autenticada Novo evento, passo Informações, com envio de capa 16 por 9, campo de nome e seleção de categoria; nome da organização ocultado.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Informações · adicionar capa, nome, categoria, descrição e line-up', 'Data e local · definir casa, endereço, início e término', 'Ingressos · cadastrar tipos, preços, quantidade e encerramento das vendas', 'Modo social · configurar quando a experiência social abre', 'Revisão · conferir os dados antes de salvar ou publicar'],
        tip: 'Use Continuar para avançar. É possível salvar como rascunho; publicar eventos pagos depende da aprovação e da conexão Stripe.',
        captureLabel: 'Cadastro real · campos vazios; não foi enviado'
      },
      {
        id: 'detalhes-do-evento',
        title: 'Administre cada evento pelo detalhe',
        description: 'Ao abrir um evento publicado, esta tela reúne as ações e os principais indicadores. Use os atalhos para compartilhar, editar, abrir check-in e gerenciar cupons. A página também organiza o estado do modo social, os tipos de ingresso e os cupons cadastrados; valores foram ocultados.',
        image: '/assets/tutorial/producer/screens/producer-event-detail-portrait.png',
        imageAlt: 'Tela autenticada de detalhes de um evento publicado com ações para compartilhar, editar, check-in e cupons; nome do evento e valor de venda foram ocultados.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Compartilhar · enviar a página pública do evento', 'Editar · voltar ao editor de cinco etapas', 'Check-in · acessar a operação quando a janela estiver aberta', 'Cupons · criar ou acompanhar códigos promocionais', 'Acompanhar ingressos vendidos, pedidos e modo social'],
        tip: 'O botão de check-in segue a data e o horário de abertura configurados no evento. Antes desse período, o app informa que a operação ainda não está disponível.',
        captureLabel: 'Detalhe autenticado · nome e valor de vendas ocultados'
      },
      {
        id: 'financeiro-do-produtor',
        title: 'Financeiro, conciliação e repasses',
        description: 'Escolha o período para consultar o saldo disponível e pendente no Stripe, o resumo de vendas e descontos, reembolsos, contestações e taxas. O estado “Conciliando” indica que alguns pedidos ainda aguardam a tarifa final da Stripe. O gráfico diário ajuda a comparar o movimento; os valores desta captura foram ocultados.',
        image: '/assets/tutorial/producer/screens/producer-finance-portrait.png',
        imageAlt: 'Tela Financeiro autenticada com saldo Stripe, resumo do período e gráfico diário; todas as quantias foram ocultadas.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Filtrar por 7, 30 ou 90 dias, ou pelo período completo', 'Ver saldo disponível e pendente na Stripe', 'Conferir vendas, cupons, reembolsos, contestações e tarifas', 'Usar Ver repasses para abrir as movimentações', 'Lembrar que conciliação e envio ao banco dependem dos prazos da Stripe'],
        tip: 'O saldo pode mudar enquanto pedidos e tarifas são conciliados. Para dados bancários e documentos de verificação, abra a conta Stripe como proprietário.',
        captureLabel: 'Financeiro autenticado · quantias ocultadas'
      },
      {
        id: 'publico-do-produtor',
        title: 'Consulte participantes e pedidos',
        description: 'Em Público, escolha o evento, use a busca por nome, ingresso ou e-mail completo e aplique os filtros de situação. Abra um participante para conferir o pedido e o estado do ingresso. O botão Exportar baixa a lista; nomes, pedidos e indicadores desta captura foram ocultados.',
        image: '/assets/tutorial/producer/screens/producer-participants-portrait.png',
        imageAlt: 'Tela autenticada Gestão de participantes com seleção de evento, aviso de check-in, busca, filtros e pedidos; nomes, identificadores e indicadores foram ocultados.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Selecionar o evento que está operando', 'Buscar por nome, ingresso ou e-mail completo', 'Filtrar todos, válidos, check-in feito, pendentes ou cancelados', 'Exportar a lista de participantes', 'Abrir um pedido para consultar o ingresso e o status de entrada'],
        tip: 'O check-in só pode ser registrado dentro da janela definida para o evento. Se estiver fora do período, o botão aparece indisponível.',
        captureLabel: 'Público autenticado · dados pessoais ocultados'
      },
      {
        id: 'leitor-de-qr',
        title: 'Use o leitor QR durante a janela de entrada',
        description: 'Quando o check-in estiver liberado, abra-o pelo detalhe do evento ou pela área Público. O atendente enquadra o QR do ingresso; o app apresenta os dados e o estado de pagamento e acesso para confirmar o check-in. A imagem abaixo é o ingresso que o participante apresenta, incluída como referência visual — não é uma captura do leitor do produtor.',
        image: '/assets/tutorial/producer/screens/producer-ticket-qr-reference.png',
        imageAlt: 'Tela de ingresso do participante com QR Code de exemplo e informações pessoais ocultadas; referência do código que o leitor do produtor verifica.',
        imageWidth: 640,
        imageHeight: 1352,
        actions: ['Abrir Check-in no detalhe ou na lista de participantes', 'Permitir o uso da câmera quando solicitado no dispositivo', 'Centralizar o QR Code do ingresso na moldura', 'Conferir o resultado antes de registrar a entrada', 'Buscar pelo participante se a leitura não funcionar'],
        tip: 'A conta de QA usada nas capturas tinha check-in previsto para 26/11/2026. Como a janela ainda não estava aberta em 09/11/2026, não foi possível capturar o leitor autenticado; a imagem não o representa.',
        captureLabel: 'Referência do ingresso do participante · não é o leitor QR'
      },
      {
        id: 'gestao-de-atendentes',
        title: 'Convide e acompanhe a equipe de check-in',
        description: 'Em Ajustes, abra Atendentes. Convide cada pessoa pelo e-mail que ela usa no Matchie e acompanhe convites pendentes, acessos ativos e revogados. A captura real mostra a organização de QA sem atendentes cadastrados, por isso a lista está no estado vazio.',
        image: '/assets/tutorial/producer/screens/producer-attendants-portrait.png',
        imageAlt: 'Tela autenticada de Gestão de atendentes com convite por e-mail, busca e estado vazio; a organização de QA não tinha atendentes cadastrados.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Enviar convite ao e-mail confirmado no Matchie', 'Buscar atendente por nome ou e-mail', 'Reenviar convites pendentes', 'Revogar ou reativar acessos pela lista', 'Exportar atendentes quando houver registros'],
        tip: 'Atendentes ativos podem selecionar eventos e validar ingressos. Dados financeiros permanecem disponíveis apenas para gestores.',
        captureLabel: 'Gestão de atendentes · estado vazio da organização QA'
      },
      {
        id: 'ajustes-do-produtor',
        title: 'Configure a organização e a equipe',
        description: 'Em Ajustes, mantenha os dados legais da organização e do responsável, cadastre casas e endereços, convide atendentes para o check-in e acesse a conta Stripe. “Voltar ao app” leva à experiência de público.',
        image: '/assets/tutorial/producer/screens/producer-settings-portrait.png',
        imageAlt: 'Seções autenticadas de Ajustes para dados da organização, casas e endereços, atendentes, Stripe e retorno ao app, sem identificação da conta.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Dados da organização · atualizar cadastro legal, responsável e logo', 'Casas e endereços · cadastrar locais dos eventos', 'Atendentes · convidar a equipe que registra check-ins', 'Conta Stripe · revisar conexão e recebimentos', 'Voltar ao app · acessar a área de público'],
        tip: 'Apenas proprietários podem administrar a conta Stripe e dados bancários. Convide atendentes com o acesso adequado à operação.',
        captureLabel: 'Ajustes autenticados · categorias sem dados da organização'
      }
    ],
    details: {
      title: 'Onde encontrar cada tarefa',
      description: 'As cinco abas cobrem a operação diária. Proprietários administram a parte financeira e a conexão Stripe; gerentes acompanham eventos e público sem acesso a saldos ou dados bancários.',
      actions: ['Início · indicadores por período, atalhos e próximos eventos', 'Eventos · filtrar próximos, rascunhos ou encerrados; buscar e abrir um evento para editar, compartilhar, criar cupons ou acompanhar pedidos', 'Financeiro · vendas, taxas, saldo disponível ou pendente e repasses · proprietário', 'Público · selecionar um evento, buscar participantes, consultar ingressos e registrar check-ins', 'Ajustes · dados da organização, casas e endereços, atendentes e conta Stripe'],
      tip: 'Para publicar eventos pagos e receber vendas, conecte o Stripe e conclua as verificações solicitadas. Eventos e repasses dependem do status liberado pela Stripe.'
    }
  },
  {
    id: 'produtor-stripe',
    nav: 'Conta Stripe',
    number: '03',
    eyebrow: 'Pagamentos e repasses',
    title: 'Entenda o status da conta e onde resolver cada etapa.',
    intro: 'A conta Stripe é vinculada depois da aprovação da organização. O painel indica se a conexão está ativa; o Financeiro reúne vendas, taxas, estornos, disputas e repasses. Documentos de verificação e dados bancários são gerenciados no Stripe Dashboard.',
    screens: [
      {
        id: 'stripe-status-conectado',
        title: 'Confirme se a conta está conectada',
        description: 'No topo do painel, o selo informa a situação da conexão Stripe. Este recorte mostra “Stripe conectado” na conta de QA usada para capturar o tutorial; a situação exibida na sua organização pode ser diferente.',
        image: '/assets/tutorial/producer/screens/producer-overview-portrait.png',
        imageAlt: 'Visão geral retrato do painel autenticado com o selo Stripe conectado; identificação e valores foram ocultados.',
        imageWidth: 1320,
        imageHeight: 2868,
        actions: ['Ajustes → Conta Stripe · consultar a situação e continuar a configuração', 'Financeiro · comparar saldo disponível e pendente com o resumo de vendas', 'Stripe Dashboard · resolver verificações e atualizar dados da empresa ou do banco'],
        tip: 'O selo confirma a conexão no momento da captura. Para pendências ou mudanças nos requisitos, consulte o Stripe Dashboard e o manual correspondente.',
        captureLabel: 'Painel autenticado · selo de status recortado'
      }
    ],
    statusCards: [
      { title: 'Não conectada', description: 'O proprietário inicia a configuração Stripe para habilitar vendas pagas.' },
      { title: 'Cadastro incompleto', description: 'Continue o onboarding Stripe de onde parou e conclua os dados solicitados.' },
      { title: 'Em análise', description: 'Aguarde a conferência e atualize o status no app.' },
      { title: 'Ação necessária', description: 'Revise no Stripe Dashboard os dados ou documentos solicitados.' },
      { title: 'Recebimentos pausados', description: 'A conta precisa resolver uma pendência Stripe para voltar a receber.' },
      { title: 'Conta desvinculada', description: 'O proprietário pode conectar uma conta Stripe válida para voltar a vender.' },
      { title: 'Conectada', description: 'Confira os meios de pagamento ativos e abra o Stripe Dashboard para ver saldo e repasses.' }
    ],
    details: {
      title: 'Leia o financeiro e resolva cada pendência',
      description: 'O proprietário administra o vínculo Stripe e acessa o Financeiro. Essa tela reúne saldos disponível e pendente, vendas por período, cupons, reembolsos, disputas, taxas Stripe e o valor líquido em conciliação. A área de pedidos e a visão por evento ajudam a conferir de onde vêm os valores; Repasses mostra as movimentações destinadas à conta bancária.',
      actions: ['Ajustes → Conta Stripe · revisar o estado da conexão', 'Financeiro → comparar saldo disponível, saldo pendente e desempenho do período', 'Pedidos e taxas · conferir vendas, reembolsos e taxas aplicadas', 'Repasses · acompanhar os valores enviados e o histórico', 'Stripe Dashboard · enviar documentos, atualizar a empresa e consultar a conta bancária'],
      tip: 'No Brasil, a conta bancária de recebimento precisa ser compatível e vinculada ao mesmo CPF ou CNPJ da conta Stripe. Confira os requisitos atuais nos manuais da Stripe.'
    },
    resources: [
      { label: 'Conectar a Stripe por uma plataforma parceira', href: 'https://support.stripe.com/questions/getting-started-with-stripe-through-a-third-party-platform?locale=pt-BR' },
      { label: 'Consultar o status de verificação da conta', href: 'https://support.stripe.com/questions/what-is-the-verification-status-of-my-account?locale=pt-BR' },
      { label: 'Atualizar a conta bancária de recebimento', href: 'https://support.stripe.com/questions/update-bank-account-information?locale=pt-BR' },
      { label: 'Ver bancos aceitos para receber no Brasil', href: 'https://support.stripe.com/questions/supported-bank-accounts-in-brazil?locale=pt-BR' }
    ]
  }
];
