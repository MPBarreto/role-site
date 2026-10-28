// Fonte: Role_Orcamento_18m_Growth_100_Hosts.xlsx, Caixa Rolê!A1:N19.
// Despesas operacionais = Receita Rolê (coluna C) - EBITDA antes de CAPEX (coluna N).
const projection = [
  { month: 'Jan/27', revenue: 1564, ebitda: -27466.8608015169 },
  { month: 'Fev/27', revenue: 3236.8, ebitda: -26841.1401698876 },
  { month: 'Mar/27', revenue: 5854.8, ebitda: -26427.7756685998 },
  { month: 'Abr/27', revenue: 7772.4, ebitda: -33873.896282217 },
  { month: 'Mai/27', revenue: 11580.4, ebitda: -42730.5374772148 },
  { month: 'Jun/27', revenue: 17442, ebitda: -29684.1754642225 },
  { month: 'Jul/27', revenue: 25520.4, ebitda: -52618.0973124745 },
  { month: 'Ago/27', revenue: 35006.4, ebitda: -36610.055470022 },
  { month: 'Set/27', revenue: 47980.8, ebitda: -42721.6597171115 },
  { month: 'Out/27', revenue: 62634.8, ebitda: -30937.2513255846 },
  { month: 'Nov/27', revenue: 82212, ebitda: -32758.8707949203 },
  { month: 'Dez/27', revenue: 103795.2, ebitda: -3795.0635316303 },
  { month: 'Jan/28', revenue: 128574.4, ebitda: -23237.9960786632 },
  { month: 'Fev/28', revenue: 155577.2, ebitda: 14868.9289184336 },
  { month: 'Mar/28', revenue: 183722.4, ebitda: 18813.9482381885 },
  { month: 'Abr/28', revenue: 210630, ebitda: 28132.9769873277 },
  { month: 'Mai/28', revenue: 238571.2, ebitda: 46951.8766126127 },
  { month: 'Jun/28', revenue: 270034.8, ebitda: 72163.8348592263 },
];

const COLORS = {
  background: '#0b0d0e',
  border: '#25282a',
  grid: '#292d30',
  text: '#f5f3f5',
  muted: '#b8b6ba',
  revenue: '#ff3185',
  expenses: '#505356',
  ebitda: '#ff8958',
};

const formatMil = value => new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
}).format(value);

export function renderFinanceChart(target) {
  if (!target) return;

  const plot = { left: 90, right: 960, top: 465, bottom: 579 };
  const minimum = -60;
  const maximum = 300;
  const y = value => plot.bottom - ((value - minimum) / (maximum - minimum)) * (plot.bottom - plot.top);
  const step = (plot.right - plot.left) / projection.length;
  const x = index => plot.left + step * (index + 0.5);
  const zero = y(0);
  const ticks = [-50, 0, 100, 200, 300];

  const grid = ticks.map(value => {
    const lineY = y(value);
    const stroke = value === 0 ? '#7d8184' : COLORS.grid;
    const width = value === 0 ? 1.15 : 0.8;
    return `<g>
      <line x1="${plot.left}" y1="${lineY}" x2="${plot.right}" y2="${lineY}" stroke="${stroke}" stroke-width="${width}" />
      <text x="78" y="${lineY + 3.5}" text-anchor="end" class="axis-label">${value}</text>
    </g>`;
  }).join('');

  const bars = projection.map((point, index) => {
    const center = x(index);
    const revenue = point.revenue / 1000;
    const expenses = (point.revenue - point.ebitda) / 1000;
    const revenueTop = y(revenue);
    const expenseTop = y(expenses);
    const highlighted = point.month === 'Fev/28';
    return `<g>
      <rect x="${center - 10}" y="${revenueTop}" width="9" height="${Math.max(1, zero - revenueTop)}" rx="1.5" fill="${COLORS.revenue}" />
      <rect x="${center + 1}" y="${expenseTop}" width="9" height="${Math.max(1, zero - expenseTop)}" rx="1.5" fill="${COLORS.expenses}" />
      <text x="${center}" y="626" text-anchor="middle" class="month-label${highlighted ? ' month-label--breakeven' : ''}">${point.month}</text>
    </g>`;
  }).join('');

  const path = projection.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.ebitda / 1000)}`).join(' ');
  const points = projection.map((point, index) => {
    const isBreakeven = point.month === 'Fev/28';
    return `<circle cx="${x(index)}" cy="${y(point.ebitda / 1000)}" r="${isBreakeven ? 4.1 : 3.3}" fill="${isBreakeven ? COLORS.ebitda : '#ffe3d3'}" stroke="${COLORS.ebitda}" stroke-width="2" />`;
  }).join('');
  const last = projection.at(-1);

  target.innerHTML = `<svg viewBox="0 0 1018 768" role="img" aria-labelledby="finance-chart-title finance-chart-description" xmlns="http://www.w3.org/2000/svg">
    <title id="finance-chart-title">Evolução mensal de receita, despesas operacionais e EBITDA</title>
    <desc id="finance-chart-description">De janeiro de 2027 a junho de 2028, a receita ultrapassa as despesas operacionais em fevereiro de 2028. O EBITDA passa de menos 23,2 mil reais em janeiro de 2028 para mais 14,9 mil em fevereiro, e chega a 72,2 mil em junho de 2028.</desc>
    <defs>
      <linearGradient id="finance-card-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0b0e0f" />
        <stop offset="1" stop-color="#111012" />
      </linearGradient>
    </defs>
    <rect x="35" y="406" width="951" height="247" rx="15" fill="url(#finance-card-fill)" stroke="${COLORS.border}" />

    <text x="56" y="434" class="chart-heading">EVOLUÇÃO MENSAL (R$ mil)</text>
    <g class="legend">
      <rect x="383" y="426" width="16" height="9" rx="3" fill="${COLORS.revenue}" />
      <text x="408" y="434">Receita Rolê</text>
      <rect x="497" y="426" width="16" height="9" rx="3" fill="${COLORS.expenses}" />
      <text x="522" y="434">Despesas operacionais</text>
      <path d="M 672 430.5 h 15" fill="none" stroke="${COLORS.ebitda}" stroke-width="3.5" stroke-linecap="round" />
      <circle cx="679.5" cy="430.5" r="3" fill="${COLORS.ebitda}" />
      <text x="699" y="434">EBITDA</text>
    </g>

    ${grid}
    ${bars}
    <path d="${path}" fill="none" stroke="${COLORS.ebitda}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" />
    ${points}

    <g aria-hidden="true">
      <rect x="863" y="417" width="111" height="43" rx="8" fill="#100d12" stroke="#8e2855" />
      <text x="918.5" y="435" text-anchor="middle" class="callout-value">R$ ${formatMil(last.revenue / 1000)} mil</text>
      <text x="918.5" y="451" text-anchor="middle" class="callout-label">receita/mês</text>
      <path d="M 934 460 L 946 460 L 940 467 Z" fill="#100d12" stroke="#8e2855" stroke-linejoin="round" />
    </g>

    <style>
      text { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .chart-heading { fill: ${COLORS.text}; font-size: 13px; font-weight: 700; letter-spacing: 2.6px; }
      .legend { fill: ${COLORS.text}; font-size: 10px; font-weight: 500; }
      .axis-label { fill: ${COLORS.muted}; font-size: 10px; font-variant-numeric: tabular-nums; }
      .month-label { fill: ${COLORS.text}; font-size: 9.3px; font-weight: 450; font-variant-numeric: tabular-nums; }
      .month-label--breakeven { fill: ${COLORS.revenue}; font-size: 9.6px; font-weight: 750; }
      .callout-value { fill: ${COLORS.revenue}; font-size: 14px; font-weight: 750; }
      .callout-label { fill: #ffabc7; font-size: 10.5px; font-weight: 550; }
    </style>
  </svg>`;
}
