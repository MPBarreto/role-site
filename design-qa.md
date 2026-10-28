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

- Os slides 1–10 agora exibem cada composição de referência completa, sem recortar os mockups, redesenhar seus textos ou sobrepor elementos HTML.
- Os slides 11 e 12 usam os dois painéis completos da referência financeira mais recente. O arquivo composto foi separado somente no divisor central.
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
- Chromium local em desktop de 1672 × 941 px: slides 1–10 preservam a proporção de 1672 × 941; slides 11–12 preservam 1018 × 768. Cada imagem preenche o canvas sem recorte.
- Chromium local em celular de 390 × 844 px: 12 slides navegáveis, sem rolagem horizontal; as imagens mantêm suas proporções e os controles ficam acessíveis.
- Navegação anterior/próximo, botões numerados, teclas Home/ArrowRight/End e gesto horizontal foram verificados. As 12 imagens carregaram e não houve erros de console.
- `npm run build`: aprovado.

**final result: passed** — as 12 composições correspondem às referências integrais e a navegação segue funcionando em desktop e celular.
