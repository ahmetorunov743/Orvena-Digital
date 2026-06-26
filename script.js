// ==========================================================================
// WebCraft — общий скрипт сайта
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initFooterYear();
  initCalculator();
  initContactMethodToggle();
  initWhatsAppCombine();
});

/* ---------- Мобильное меню ---------- */
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Год в футере ---------- */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Калькулятор стоимости ----------
   Структура цен. Меняйте суммы здесь — расчёт обновится сам.
*/
const PRICES = {
  type: {
    landing: 50,
    corporate: 150,
    shop: 500,
  },
  design: {
    template: 0,
    custom: 50,
  },
  addons: {
    seo: 50,
    multilang: 100,
    crm: 10,
  },
};

function initCalculator() {
  const form = document.querySelector("[data-calculator]");
  if (!form) return;

  const amountEl = form.querySelector("[data-total-amount]");
  const breakdownEl = form.querySelector("[data-total-breakdown]");
  const summaryField = form.querySelector("[data-summary-field]");

  function recalc() {
    let total = 0;
    const lines = [];

    const typeInput = form.querySelector('input[name="site-type"]:checked');
    if (typeInput) {
      const price = PRICES.type[typeInput.value] || 0;
      total += price;
      lines.push(`${typeInput.dataset.label} — $${price}`);
    }

    const designInput = form.querySelector('input[name="design-type"]:checked');
    if (designInput) {
      const price = PRICES.design[designInput.value] || 0;
      total += price;
      if (price > 0) lines.push(`${designInput.dataset.label} — +$${price}`);
    }

    form.querySelectorAll('input[name="addon"]:checked').forEach((input) => {
      const price = PRICES.addons[input.value] || 0;
      total += price;
      lines.push(`${input.dataset.label} — +$${price}`);
    });

    if (amountEl) {
      amountEl.textContent = `$${total}`;
      amountEl.classList.remove("pulse");
      // restart animation
      void amountEl.offsetWidth;
      amountEl.classList.add("pulse");
    }
    if (breakdownEl) {
      breakdownEl.textContent = lines.length
        ? lines.join(" · ")
        : "Выберите параметры выше, чтобы увидеть смету";
    }
    if (summaryField) {
      summaryField.value = lines.length
        ? `${lines.join("; ")}. Итого: $${total}`
        : "Параметры не выбраны";
    }
  }

  form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", recalc);
  });

  recalc();
}

/* ---------- Способ связи: Telegram / WhatsApp ----------

   Обе формы (контакты и калькулятор) отправляются обычным способом
   прямо в Formspree (action="https://formspree.io/f/..." в самом <form>),
   без перехвата через JS. Поэтому:
   - после отправки браузер реально переходит на новую страницу thanks.html
     (это задаёт скрытое поле <input type="hidden" name="_next" ...>);
   - при возврате назад браузер сам восстанавливает значения полей —
     ничего специально для этого делать не нужно, лишь бы JS не сбрасывал
     форму сам (мы это не делаем).

   Код ниже отвечает только за переключение блоков "Telegram" / "WhatsApp"
   и за сборку готовой WhatsApp-ссылки перед отправкой.
*/
function initContactMethodToggle() {
  document.querySelectorAll('input[name="Способ связи"]').forEach((radio) => {
    radio.addEventListener("change", (e) => updateContactFields(e.target.closest("form")));
  });
  document.querySelectorAll("form").forEach((form) => updateContactFields(form));
}

function updateContactFields(form) {
  if (!form) return;
  const checked = form.querySelector('input[name="Способ связи"]:checked');
  if (!checked) return;
  const method = checked.value; // "Telegram" | "WhatsApp"

  form.querySelectorAll("[data-method-field]").forEach((group) => {
    const isActive = group.dataset.methodField === method;
    group.hidden = !isActive;
    group.querySelectorAll("input, select").forEach((field) => {
      field.disabled = !isActive;
      field.required = isActive;
    });
  });
}

/* Перед отправкой формы собираем "код страны + номер" в одну готовую
   WhatsApp-ссылку (wa.me/...), чтобы в письме можно было сразу кликнуть
   и открыть чат, а не вручную набирать номер. */
function initWhatsAppCombine() {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", () => {
      const code = form.querySelector('select[name="Код страны"]');
      const phone = form.querySelector('input[name="Номер WhatsApp"]');
      const combined = form.querySelector("[data-whatsapp-combined]");
      if (code && phone && combined && !phone.disabled) {
        const digits = `${code.value}${phone.value}`.replace(/[^\d]/g, "");
        combined.value = digits ? `https://wa.me/${digits}` : "";
      }
    });
  });
}
