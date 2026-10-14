# Rolê — Site

Site institucional/comercial do Rolê, desenvolvido a partir dos mockups aprovados da marca e orientado ao ICP de casas de show, bares, festas e produtores de eventos.

## Estrutura

- Hero com proposta de valor B2B
- Dor orientada à solução
- Solução e jornada: evento → ingresso → pessoas → match → conversa → check-in
- Benefícios para casa e público
- Próximos eventos via API com fallback local
- CTA para App Store / Google Play
- FAQ
- Footer e WhatsApp protegido por endpoint server-side

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`.

Para gerar a versão de produção, use `npm run build`; os arquivos ficam em `dist/`. `npm run preview` abre essa versão localmente.

As rotas `/api/*` continuam como Vercel Functions. O servidor do Vite não executa essas funções: para validar eventos reais e o contato do WhatsApp localmente, use `vercel dev` com as variáveis do servidor configuradas.

## Configuração das lojas

Copie `.env.example` para `.env.local` e configure os valores públicos do Vite:

```env
VITE_APP_STORE_URL=https://apps.apple.com/...
VITE_GOOGLE_PLAY_URL=https://play.google.com/store/apps/...
```

Enquanto as URLs estiverem vazias, os botões aparecem visualmente, mas não redirecionam para uma loja incorreta.

## Próximos eventos

Configure em produção:

- `EVENTS_API_URL`: endpoint público/privado que retorna os próximos eventos.
- `EVENTS_API_TOKEN`: opcional, enviado como Bearer token pelo proxy server-side.

O adaptador aceita uma lista direta ou `{ events: [...] }` / `{ data: [...] }` e normaliza campos comuns como `title`, `cover_url`, `location`, `attendee_count` e `genres`.

## WhatsApp protegido

O número **não fica no HTML nem no JavaScript público**. O fluxo é:

1. `/api/contact-token` gera um token HMAC temporário.
2. O botão envia um POST para `/api/contact`.
3. O servidor valida token, idade mínima, honeypot, origem e um rate limit básico.
4. Só então monta e devolve a URL do WhatsApp.

Variáveis necessárias:

```env
CONTACT_SECRET=uma-chave-longa-e-aleatoria
WHATSAPP_NUMBER=5511999999999
WHATSAPP_MESSAGE=Olá! Quero saber como levar o Rolê para minha casa de eventos.
SITE_HOST=seu-dominio.com
```

## Antes de publicar

- Trocar `example.com` em `robots.txt` e `sitemap.xml` pelo domínio final.
- Inserir URLs oficiais da App Store e Google Play em `.env.local`.
- Configurar variáveis do WhatsApp e API de eventos.
- Substituir as páginas legais provisórias pelo texto jurídico aprovado.

## Design tokens principais

- Midnight: `#09070D`
- Rolê Pink: `#FF2B8A`
- Afterglow Coral: `#FF5F74`
- Electric Violet: `#8A4DFF`
- Off White: `#F7F5F8`
- Signal Lime: `#B8FF3D`
- Tipografia: Inter/system sans

A logo, o ícone, o manifesto e os arquivos de SEO ficam em `public/`; os arquivos públicos mantêm seus caminhos no site publicado.
