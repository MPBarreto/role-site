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
