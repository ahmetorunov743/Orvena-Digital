// ==========================================================================
// WebCraft — общий скрипт сайта
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initFooterYear();
  initCalculator();
  initForms();
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

/* ---------- Отправка форм (контакты / калькулятор) ----------
   По умолчанию форма открывает почтовый клиент пользователя (mailto),
   это работает без какого-либо backend на GitHub Pages.

   Чтобы вместо этого письма приходили "тихо", без открытия почтового
   приложения у клиента — подключите бесплатный Formspree:
   1. Зарегистрируйтесь на https://formspree.io
   2. Создайте форму, привязанную к вашей почте, скопируйте её ID
   3. Замените значение FORMSPREE_ENDPOINT ниже на
      "https://formspree.io/f/ВАШ_ID"
   4. В каждой <form> поменяйте data-mailto="..." на
      action="https://formspree.io/f/ВАШ_ID" method="POST" и уберите
      атрибут data-mailto — скрипт ниже сам отключится для такой формы.
*/
const FORMSPREE_ENDPOINT = ""; // оставьте пустым, чтобы использовать mailto

function initForms() {
  document.querySelectorAll("form[data-mailto]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      const to = form.dataset.mailto;
      const data = new FormData(form);

      const requiredOk = Array.from(form.querySelectorAll("[required]")).every(
        (field) => field.value.trim() !== ""
      );
      if (!requiredOk) {
        if (status) {
          status.textContent = "Заполните, пожалуйста, обязательные поля.";
          status.className = "form-status err";
        }
        return;
      }

      const subject = encodeURIComponent(form.dataset.subject || "Заявка с сайта WebCraft");
      const bodyLines = [];
      data.forEach((value, key) => {
        if (value) bodyLines.push(`${key}: ${value}`);
      });
      const body = encodeURIComponent(bodyLines.join("\n"));

      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

      if (status) {
        status.textContent = "Откроется ваш почтовый клиент с готовым письмом — просто нажмите «Отправить».";
        status.className = "form-status ok";
      }
    });
  });
}
