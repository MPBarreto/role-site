import { initializeTracking } from './tracking.js';
import './protected-email.js';

initializeTracking();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findSectionByHeading(text) {
  return [...document.querySelectorAll('.legal-content section')].find((section) =>
    section.querySelector('h3')?.textContent?.trim().startsWith(text)
  );
}

async function loadProtectedLegalIdentity() {
  if (window.location.pathname !== '/terms' && window.location.pathname !== '/terms.html') return;

  const section = findSectionByHeading('1.4.');
  if (!section) return;

  const details = document.createElement('div');
  details.className = 'legal-note';
  details.setAttribute('data-legal-identity', '');
  details.setAttribute('aria-live', 'polite');
  details.textContent = 'Carregando identificação da operadora…';
  section.append(details);

  try {
    const tokenResponse = await fetch('/api/legal-token', {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (!tokenResponse.ok) throw new Error('legal_token');
    const { token } = await tokenResponse.json();

    await sleep(2000);

    const response = await fetch('/api/legal-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token, website: '' }),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('legal_details');
    const data = await response.json();

    details.replaceChildren();
    const lines = [
      ['Operadora:', data.companyName],
      ['CNPJ:', data.cnpj],
      ['Endereço:', data.address]
    ];

    for (const [label, value] of lines) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label} `;
      p.append(strong, document.createTextNode(value || '—'));
      details.append(p);
    }
  } catch {
    details.textContent = 'Não foi possível carregar os dados cadastrais agora. Recarregue a página ou utilize os canais oficiais de suporte do Rolê.';
  }
}

function applyRefundWindowCopy() {
  if (window.location.pathname !== '/terms' && window.location.pathname !== '/terms.html') return;

  const section = findSectionByHeading('2.10.');
  if (!section) return;

  const paragraphs = section.querySelectorAll('p');
  if (!paragraphs.length) return;

  paragraphs[0].innerHTML = 'Nas compras realizadas por meio eletrônico, o Rolê adota como regra operacional de arrependimento a possibilidade de solicitação de cancelamento em até <strong>7 (sete) dias corridos contados da compra</strong>, desde que o pedido seja realizado com antecedência mínima de <strong>48 (quarenta e oito) horas do horário de início do Evento</strong>. Se o Evento ocorrer antes do término do prazo de 7 dias, prevalece, para o fluxo ordinário de autoatendimento, o limite de 48 horas antes do início do Evento.';

  if (paragraphs[1]) {
    paragraphs[1].innerHTML = 'Quando a solicitação estiver dentro dessa janela e o ingresso não tiver sido utilizado, o reembolso será <strong>integral dos valores pagos pelo consumidor</strong>, inclusive Taxa de Serviço Rolê e demais taxas acessórias reembolsáveis por lei. Custos de processamento eventualmente não devolvidos pelo provedor de pagamento não serão descontados do consumidor quando houver direito à restituição integral.';
  }

  if (paragraphs[2]) {
    paragraphs[2].innerHTML = 'A regra de “7 dias da compra + 48 horas antes do Evento” disciplina o fluxo operacional padrão do Rolê e <strong>não limita direitos obrigatórios mais favoráveis assegurados pela legislação aplicável</strong>, inclusive em hipóteses de cancelamento, adiamento, alteração relevante do Evento ou outras situações em que a restituição seja legalmente devida.';
  }
}

applyRefundWindowCopy();
loadProtectedLegalIdentity();
