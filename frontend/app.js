const output = document.getElementById("output");
const apiBaseInput = document.getElementById("apiBase");
const clearTokenButton = document.getElementById("clearToken");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const incomeForm = document.getElementById("incomeForm");
const fixedAmount = document.getElementById("fixedAmount");
const growthAmount = document.getElementById("growthAmount");
const personalAmount = document.getElementById("personalAmount");
const totalIncome = document.getElementById("totalIncome");
const pages = document.querySelectorAll(".page");
const steps = document.querySelectorAll(".step");
const nextButtons = document.querySelectorAll(".next-step");
const prevButtons = document.querySelectorAll(".prev-step");
const views = document.querySelectorAll(".view");

const TOKEN_KEY = "incomeManagerToken";
const STORAGE_STEP_KEY = "incomeManagerStep";

const formatJson = (data) => JSON.stringify(data, null, 2);

const updateOutput = (payload) => {
  output.textContent = payload;
};

const getApiBase = () => apiBaseInput.value.replace(/\/$/, "");

const storeToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const setView = (viewName) => {
  views.forEach((view) => {
    view.classList.toggle("active", view.dataset.view === viewName);
  });
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  updateOutput("Token silindi. Yeni əməliyyat üçün hazırdır...");
  setView("auth");
};

const postJson = async (path, body) => {
  const response = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatJson(responseBody) || response.statusText);
  }

  return responseBody;
};

const fetchWithToken = async (path, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("Token yoxdur. Zəhmət olmasa daxil olun.");
  }
  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatJson(responseBody) || response.statusText);
  }

  return responseBody;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }
  return Number(value).toLocaleString("az-AZ", {
    style: "currency",
    currency: "AZN",
  });
};

const goToStep = (stepName) => {
  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.step === stepName);
  });
  steps.forEach((step) => {
    step.classList.toggle("active", step.dataset.step === stepName);
  });
  localStorage.setItem(STORAGE_STEP_KEY, stepName);
};

const loadIncomeStrategy = async () => {
  const data = await fetchWithToken("/api/income/strategy");
  fixedAmount.textContent = formatCurrency(data.fixedAndEssential);
  growthAmount.textContent = formatCurrency(data.growthAndReinvestment);
  personalAmount.textContent = formatCurrency(data.personalWants);
  totalIncome.textContent = `Aylıq gəlir: ${formatCurrency(data.monthlyIncome)}`;
};

const loadIncomeStatus = async () => {
  setView("app");
  const status = await fetchWithToken("/api/income/status");
  if (status.hasMonthlyIncome) {
    await loadIncomeStrategy();
    goToStep("strategy");
  } else {
    goToStep("income");
  }
};

const handleSubmit = (form, endpoint) => async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  updateOutput("Sorğu icra olunur...");

  try {
    const data = await postJson(endpoint, payload);
    storeToken(data.token);
    updateOutput(formatJson(data));
    setView("app");
    goToStep("session");
    await loadIncomeStatus();
  } catch (error) {
    updateOutput(`Xəta: ${error.message}`);
  }
};

const activateTab = (tabName) => {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabName);
  });
};

document.getElementById("register").addEventListener(
  "submit",
  handleSubmit(document.getElementById("register"), "/api/auth/register")
);

document.getElementById("login").addEventListener(
  "submit",
  handleSubmit(document.getElementById("login"), "/api/auth/login")
);

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

steps.forEach((step) => {
  step.addEventListener("click", () => goToStep(step.dataset.step));
});

nextButtons.forEach((button) => {
  button.addEventListener("click", () => goToStep(button.dataset.next));
});

prevButtons.forEach((button) => {
  button.addEventListener("click", () => goToStep(button.dataset.prev));
});

clearTokenButton.addEventListener("click", clearToken);

incomeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(incomeForm);
  const payload = Object.fromEntries(formData.entries());
  updateOutput("Aylıq gəlir yadda saxlanır...");
  try {
    await fetchWithToken("/api/income", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await loadIncomeStatus();
    updateOutput("Aylıq gəlir yadda saxlandı. Strategiya aktivdir.");
    incomeForm.reset();
  } catch (error) {
    updateOutput(`Xəta: ${error.message}`);
  }
});

const existingToken = localStorage.getItem(TOKEN_KEY);
if (existingToken) {
  updateOutput(`Mövcud token tapıldı:\n${existingToken}`);
  loadIncomeStatus().catch((error) => {
    updateOutput(`Xəta: ${error.message}`);
  });
} else {
  setView("auth");
  goToStep(localStorage.getItem(STORAGE_STEP_KEY) || "session");
}
