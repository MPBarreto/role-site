> Arquivo histórico de QA anterior ao rebrand para Matchie. As referências a Rolê e às artes do pitch descrevem a identidade vigente na data da revisão.

# Revisão visual — site Rolê

## Direção aplicada

- **Hero:** mantém a foto de show e apresenta as telas `public/assets/telas/eventos.webp` e `public/assets/telas/deslizar.webp` em aparelhos sobrepostos. A tela de Deslizar fica em primeiro plano; Eventos aparece ao lado. Não usa as telas de Matches ou Ingresso nessa composição.
- **Eventos:** preserva os cards para comparar eventos. O ambiente local não tem eventos publicados e mostra o estado vazio previsto.
- **Jornada:** apresenta descoberta, compra, conexão e check-in como uma linha do tempo numerada com telas do app. No celular, a composição alterna a posição da imagem para facilitar a leitura em sequência.
- **Segurança:** troca os três painéis por uma lista numerada com divisórias e deixa a foto de show integrar a seção com um recorte inclinado.
- **Download:** remove o painel interno e integra o texto, as lojas e a tela do app ao fundo fotográfico da seção.
- **Produtores:** remove o painel externo e os pills, apresentando as funções em lista aberta junto às telas ilustrativas de criação de evento e check-in.
- **FAQ:** mantém os itens em caixas expansíveis, que sinalizam controles acionáveis.

## Verificação visual

- Prévia local: `http://localhost:4000/`, no Chrome.
- Hero inspecionada no desktop: dois aparelhos visíveis, com Eventos à esquerda e Deslizar à direita.
- Jornada inspecionada em viewport de 390 × 844 px: etapas alternadas, texto legível e nota final em uma coluna.
- Na viewport móvel, `document.documentElement.scrollWidth` é 390 px. As duas imagens do hero carregaram com 863 × 1822 px.
- Não foram adicionados eventos fictícios para preencher o estado vazio.
- Nenhum deploy ou commit foi feito.

## Checklist

- [x] Usar Deslizar e Eventos como as duas telas da hero.
- [x] Variar a composição das seções sem alterar os controles interativos do FAQ.
- [x] Conferir o layout desktop e móvel no navegador.

## Apresentação de investimento — `/pitch/investment`

### Auditoria e correção contra as referências anexadas — 28/10/2026

**Regressão corrigida**

- Os slides 1–10 exibem as composições completas; no slide 7, atualizei apenas o exemplo da taxa conforme a nova regra de GMV.
- O exemplo do slide 7 informa “Ingresso / GMV: R$ 100” e “Taxa Rolê (10%): R$ 10”.
- No slide 7, removi o hub oval, o logo nele e suas conexões aos cards e retratos; uma linha curva agora liga diretamente os retratos do homem e da mulher.
- No slide 8, a linha “Ferramentas para hosts” marca Rolê, Sympla, Zig e Ingresse como disponíveis.
- No slide 10, corrigi o período da vice-presidência na Associação Baiana de Startups para 2023–2024.
- Os slides 11 e 12 usam canvas 16:9. Cada painel de referência continua inteiro e centralizado; as faixas laterais usam fundo escuro em degradê para preservar a arte 4:3 sem esticar nem cortar seu conteúdo.
- No slide 11, redesenhei o gráfico com os valores mensais de `Caixa Rolê!A1:N19`. Receita e despesas se cruzam em fev/28; a série exibida vai de jan/27 a jun/28.
- Os controles continuam fora da área dos slides; navegação e numeração permanecem disponíveis.

| Slide | Composição revisada |
| --- | --- |
| 1 | Capa e proposta do Rolê |
| 2 | Problema de descoberta e relacionamento |
| 3 | Solução e jornada social |
| 4 | Tamanho de mercado |
| 5 | Produto e telas do app |
| 6 | Tração e marcos |
| 7 | Modelo de negócio |
| 8 | Comparativo competitivo |
| 9 | Estratégia go-to-market |
| 10 | Fundadores e equipe |
| 11 | Projeções financeiras |
| 12 | Pedido de investimento e alocação |

**Verificação visual e funcional**

- Comparação lado a lado de referência e captura final para os 12 slides em `/tmp/role-pitch-qa/compare-1.png` até `compare-4.png`.
- Chromium local em desktop de 1672 × 941 px: os canvases dos slides 11 e 12 medem 1473 × 829 CSS px (16:9); as imagens originais de 1018 × 768 ficam inteiras, centradas e sem recorte.
- Chromium local em celular de 390 × 844 px: 12 slides navegáveis, sem rolagem horizontal; os canvases dos slides 11 e 12 mantêm 16:9 e os controles ficam acessíveis.
- Navegação anterior/próximo, botões numerados, teclas Home/ArrowRight/End e gesto horizontal foram verificados. As 12 imagens carregaram e não houve erros de console.
- Após a atualização da taxa, confirmei o texto na captura do slide 7 e carreguei o novo WebP no navegador.
- No Chromium desktop, confirmei o gráfico atualizado em `/tmp/role-pitch-qa/finance-slide-11.png`; rota HTTP 200, sem erros de console.
- `npm run build`: aprovado.

**final result: passed** — as 12 composições e a navegação foram verificadas; o gráfico financeiro do slide 11 agora reflete a planilha indicada.

## Matchie — seção “Seu rolê, sua vibe” — 13/11/2026

**Referência e capturas**

- Referência aprovada: `/Users/mb/.codex/generated_images/01a1d77b-7a78-7933-b7c2-9444a6392424/exec-7a67cb6d-09a7-4cb6-8089-2200fbcab435.png` (1672 × 941 px).
- Desktop: `/private/tmp/matchie-vibes-qa.png` (1672 × 941 px), comparada lado a lado com a referência.
- Mobile: `/private/tmp/matchie-vibes-mobile-final.png` (500 × 1082 px). O Chrome headless manteve viewport CSS de 500 × 757 px mesmo com solicitação de 390 × 844; a quebra em coluna única da faixa mobile foi conferida nessa largura.

**Resultado**

- A seção usa o fundo escuro, gradiente rosa/coral, tipografia e cards do sistema visual do site. O container segue a largura já usada pelas outras seções.
- Os três cards têm imagem horizontal e proporção consistente; “Fazer amigos” mostra dois homens. Cada intenção inclui um texto curto.
- No mobile, o título divide em duas linhas e os cards passam para uma coluna. A viewport medida não apresentou largura de página além dos 500 px.
- O título principal, os metadados sociais e a seção “Como funciona” também comunicam que a conexão no Matchie pode seguir diferentes intenções.
- O badge do Google Play abre a página oficial do Matchie (`com.matchie.mobile`), confirmada na loja em 13/11/2026.
- `git diff --check`: aprovado. Build e testes não foram executados.

**final result: passed** — a seção aprovada foi implementada e conferida em desktop e em viewport mobile de 500 px; a captura exata em 390 px não ficou disponível pelo Chrome headless deste ambiente.
