/**
 * Rasoi Saathi - Conversational AI Assistant
 */

const RasoiSaathi = {
  isOpen: false,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const fab = document.getElementById('aiSaathiFab');
    if (fab) {
      fab.addEventListener('click', () => this.toggleChat());
    }

    const input = document.getElementById('aiChatInput');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }
  },

  toggleChat() {
    const modal = document.getElementById('aiChatModal');
    if (!modal) return;
    this.isOpen = !this.isOpen;
    modal.classList.toggle('active', this.isOpen);

    if (this.isOpen) {
      setTimeout(() => {
        const input = document.getElementById('aiChatInput');
        if (input) input.focus();
      }, 300);
    }
  },

  sendQuickPrompt(promptText) {
    const input = document.getElementById('aiChatInput');
    if (input) {
      input.value = promptText;
      this.sendMessage();
    }
  },

  async sendMessage() {
    const input = document.getElementById('aiChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    this.appendMessage(text, 'user');

    // Loading indicator
    const loadingId = this.appendLoading();

    try {
      const res = await RasoiAPI.sendChatMessage(text);
      this.removeLoading(loadingId);

      if (res.success) {
        this.appendMessage(res.reply, 'bot', res.suggested_dishes);
      } else {
        this.appendMessage('Maaf kijiye, abhi rasoi saathi se connect nahi ho pa raha.', 'bot');
      }
    } catch (err) {
      this.removeLoading(loadingId);
      this.appendMessage('Internet connection check karke dobara try karein.', 'bot');
    }
  },

  appendLoading() {
    const container = document.getElementById('aiMessagesList');
    if (!container) return null;
    const id = `loading_${Date.now()}`;
    const div = document.createElement('div');
    div.id = id;
    div.className = 'ai-bubble bot';
    div.innerHTML = `<span style="font-style: italic; color: var(--color-muted-brown);">Rasoi Saathi soch raha hai... 🍲</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  },

  removeLoading(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  appendMessage(text, sender, suggestedDishes = null) {
    const container = document.getElementById('aiMessagesList');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = `ai-bubble ${sender}`;

    // Format basic markdown bolding
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
    bubble.innerHTML = formattedText;

    // If dishes are suggested, render interactive 1-tap cart buttons!
    if (suggestedDishes && suggestedDishes.length > 0) {
      const cardsWrap = document.createElement('div');
      cardsWrap.style.marginTop = '10px';
      cardsWrap.style.display = 'flex';
      cardsWrap.style.flexDirection = 'column';
      cardsWrap.style.gap = '8px';

      suggestedDishes.forEach(dish => {
        const dCard = document.createElement('div');
        dCard.style.cssText = 'background: #fff; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border-card); display: flex; align-items: center; justify-content: space-between;';
        dCard.innerHTML = `
          <div>
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-primary);">${dish.name}</div>
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-terracotta);">₹${dish.price}</div>
          </div>
          <button class="btn btn-terracotta btn-sm" style="padding: 4px 10px; font-size: 0.75rem;" 
                  onclick="CustomerApp.addToCart('${dish.id}'); RasoiAPI.showToast('${dish.name} added to cart! 🍲');">
            + ADD
          </button>
        `;
        cardsWrap.appendChild(dCard);
      });

      bubble.appendChild(cardsWrap);
    }

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }
};
