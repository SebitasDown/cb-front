// UI-only placeholder. No functionality bound.
// Simple chat UI handler: prevent form navigation and append messages
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const messages = document.getElementById('messages');
  const sendBtn = document.getElementById('send-btn');

  if (!form || !input || !messages || !sendBtn) return;

  // Ensure the button doesn't trigger navigation
  sendBtn.setAttribute('type', 'button');

  const send = () => {
    const text = (input.value || '').trim();
    if (!text) return;
    appendUser(text);
    input.value = '';
    // Placeholder bot reply
    setTimeout(() => appendBot('Estoy procesando tu mensaje...'), 300);
  };

  const appendUser = (text) => {
    const el = document.createElement('div');
    el.className = 'user-msg';
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  };

  const appendBot = (text) => {
    const el = document.createElement('div');
    el.className = 'bot-msg';
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });

  sendBtn.addEventListener('click', send);
});


