(() => {
  const announce = (message) => {
    const status = document.querySelector('[data-share-toast], [data-toast]');
    if (!status) return;
    status.textContent = message;
    status.classList.add('show');
    clearTimeout(announce.timeout);
    announce.timeout = setTimeout(() => status.classList.remove('show'), 3200);
  };

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch {
        // Use the document fallback for browsers or permissions without Clipboard API access.
      }
    }

    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    if (!copied) throw new Error('clipboard_unavailable');
  };

  document.addEventListener('click', async (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-share-url]') : null;
    if (!button || button.disabled) return;

    event.preventDefault();
    event.stopPropagation();
    const url = button.dataset.shareUrl || window.location.href;
    const payload = {
      title: button.dataset.shareTitle || document.title,
      text: button.dataset.shareText || '',
      url,
    };
    button.disabled = true;

    try {
      if (navigator.share) {
        try {
          await navigator.share(payload);
          announce('Evento compartilhado.');
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }

      await copyText(url);
      announce('Link do evento copiado. Compartilhe com seus amigos.');
    } catch {
      announce('Não foi possível compartilhar agora. Tente novamente.');
    } finally {
      button.disabled = false;
    }
  });
})();
