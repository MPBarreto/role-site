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
  }
];

export const pendingFeatures = [
  {
    title: 'Tickets',
    description: 'A carteira organiza ingressos próximos, passados e cancelados. Abra um ingresso para consultar os dados do evento e o QR de acesso.',
    actions: ['Abrir ingresso', 'Ver pedido e comprovante', 'Ativar ou editar o modo social'],
    tip: 'Transferência e reembolso seguem as regras e os prazos do pedido e do evento.'
  },
  {
    title: 'Deslizar e Acender',
    description: 'Conheça participantes elegíveis dos eventos em que você ativou o modo social. Apagar remove o perfil atual do deck; Acender demonstra interesse.',
    actions: ['Filtrar por evento, cidade ou data', 'Abrir perfil', 'Apagar', 'Acender'],
    tip: 'A prévia de demonstração não registra decisões. No app, a visibilidade depende do ingresso e das preferências sociais do evento.'
  },
  {
    title: 'Match',
    description: 'Quando duas pessoas demonstram interesse uma pela outra, o Matchie cria um match e permite iniciar uma conversa.',
    actions: ['Ver matches', 'Buscar por pessoa ou evento', 'Abrir perfil ou conversa'],
    tip: 'Um match depende do interesse mútuo; sem matches, a tela oferece um atalho para continuar descobrindo pessoas.'
  },
  {
    title: 'Chat',
    description: 'As conversas aparecem depois de um match. Na conversa, participantes podem trocar mensagens e consultar as informações disponíveis sobre o rolê.',
    actions: ['Ler e enviar mensagens', 'Compartilhar mídia compatível', 'Abrir informações da conversa'],
    tip: 'O chat fica disponível após o interesse mútuo no mesmo evento. A rota de demonstração usa uma conversa fictícia.'
  },
  {
    title: 'Perfil',
    description: 'Consulte e atualize seus dados, fotos e interesses. A área também reúne atalhos para ingressos, pagamentos, notificações, privacidade, segurança e suporte.',
    actions: ['Editar informações e fotos', 'Abrir atalhos da conta', 'Consultar dados e preferências'],
    tip: 'O que outras pessoas podem ver depende das suas configurações de privacidade e visibilidade.'
  },
  {
    title: 'Notificações',
    description: 'A caixa de entrada separa novidades de matches, chats, eventos e segurança. Preferências permitem ajustar push, prévia, som, vibração, badges, e-mail e categorias.',
    actions: ['Filtrar por categoria', 'Abrir uma notificação', 'Ajustar preferências e modo silencioso'],
    tip: 'A disponibilidade de push também depende das permissões do dispositivo.'
  },
  {
    title: 'Segurança',
    description: 'Revise as proteções da conta, configure a autenticação em duas etapas e consulte dispositivos, sessões e opções de denúncia.',
    actions: ['Configurar duas etapas', 'Revisar dispositivos e sessões', 'Consultar central de segurança'],
    tip: 'A exclusão da conta é uma ação separada e pode encerrar o acesso aos dados, matches e conversas.'
  },
  {
    title: 'Privacidade e ajustes da conta',
    description: 'Não há uma tela única chamada Configurações para participantes. Os atalhos da conta levam a áreas separadas para visibilidade, interações, pessoas bloqueadas, dados, notificações e pagamentos.',
    actions: ['Gerenciar visibilidade do perfil', 'Consultar regras de interação', 'Revisar bloqueios e permissões de dados'],
    tip: 'As opções disponíveis variam conforme a versão do app e a situação da conta.'
  },
  {
    title: 'Central do produtor',
    description: 'Contas de produtor têm uma área própria para administrar organizações, eventos, participantes, cupons e check-in.',
    actions: ['Gerenciar eventos e locais', 'Acompanhar participantes', 'Validar ingressos no check-in'],
    tip: 'Esta área é exclusiva para contas com acesso de produtor.'
  }
];
