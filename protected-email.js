const TOKEN_MINIMUM_AGE_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getSupportEmail() {
  const tokenResponse = await fetch('/api/legal-token', {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });
  if (!tokenResponse.ok) throw new Error('token');
  const { token } = await tokenResponse.json();

  await sleep(TOKEN_MINIMUM_AGE_MS);

  const response = await fetch('/api/support-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token, website: document.querySelector('[data-email-honeypot]')?.value || '' }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('email');
  const data = await response.json();
  if (typeof data.email !== 'string' || !data.email.includes('@')) throw new Error('email');
  return data.email;
}

document.querySelectorAll('[data-protected-email]').forEach((link) => {
  link.addEventListener('click', async (event) => {
    if (link.dataset.emailReady === 'true') return;
    event.preventDefault();
    if (link.dataset.loading === 'true') return;

    link.dataset.loading = 'true';
    link.setAttribute('aria-busy', 'true');
    link.textContent = 'Carregando e-mail…';

    try {
      const email = await getSupportEmail();
      const subject = encodeURIComponent(link.dataset.emailSubject || 'Contato com o Rolê');
      link.href = `mailto:${email}?subject=${subject}`;
      link.textContent = email;
      link.dataset.emailReady = 'true';
      link.setAttribute('aria-label', `Abrir e-mail para ${link.dataset.emailPurpose || 'suporte'}: ${email}`);
    } catch {
      link.textContent = 'Não foi possível carregar. Tente novamente.';
      link.setAttribute('aria-label', 'Não foi possível carregar o e-mail. Tente novamente.');
    } finally {
      delete link.dataset.loading;
      link.removeAttribute('aria-busy');
      link.focus();
    }
  });
});
