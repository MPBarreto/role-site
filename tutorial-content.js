export const tutorialSections = [
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
        image: '/assets/tutorial/matchie/screens/matchie-events.jpg',
        imageAlt: 'Lista de eventos no Matchie com filtros e cartões de eventos em Salvador.',
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
        image: '/assets/tutorial/matchie/screens/matchie-event-attendees.jpg',
        imageAlt: 'Aba Quem vai do evento com aviso de que a produção ainda não liberou o modo social.',
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
        image: '/assets/tutorial/matchie/screens/matchie-tickets-empty-iphone16.png',
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
        image: '/assets/tutorial/matchie/screens/matchie-swipe-empty-iphone16.png',
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
        image: '/assets/tutorial/matchie/screens/matchie-matches-empty-iphone16.png',
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
        image: '/assets/tutorial/matchie/screens/matchie-chat-empty-iphone16.png',
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
  }
];

export const pendingFeatures = [
  {
    title: 'Área do produtor',
    description: 'Contas autorizadas de produtor têm atalhos próprios para administrar a organização e os eventos. Este fluxo requer acesso de produtor e ainda não tem uma captura segura incluída no guia.',
    actions: ['Gerenciar eventos', 'Acompanhar participantes', 'Fazer check-in'],
    tip: 'A área é exclusiva para contas com permissão de produtor.'
  }
];
