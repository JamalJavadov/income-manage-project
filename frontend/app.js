const output = document.getElementById("output");
const apiBaseInput = document.getElementById("apiBase");
const clearTokenButton = document.getElementById("clearToken");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const incomeVerificationSection = document.getElementById("incomeVerification");
const incomeStrategySection = document.getElementById("incomeStrategy");
const incomeForm = document.getElementById("incomeForm");
const fixedAmount = document.getElementById("fixedAmount");
const growthAmount = document.getElementById("growthAmount");
const personalAmount = document.getElementById("personalAmount");
const totalIncome = document.getElementById("totalIncome");

const TOKEN_KEY = "incomeManagerToken";

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

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  updateOutput("Token cleared. Ready for action...");
  setIncomeVisibility({ showVerification: false, showStrategy: false });
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
    throw new Error("No token available. Please sign in.");
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

const setIncomeVisibility = ({ showVerification, showStrategy }) => {
  incomeVerificationSection.classList.toggle("hidden", !showVerification);
  incomeStrategySection.classList.toggle("hidden", !showStrategy);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }
  return Number(value).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
};

const loadIncomeStrategy = async () => {
  const data = await fetchWithToken("/api/income/strategy");
  fixedAmount.textContent = formatCurrency(data.fixedAndEssential);
  growthAmount.textContent = formatCurrency(data.growthAndReinvestment);
  personalAmount.textContent = formatCurrency(data.personalWants);
  totalIncome.textContent = `Monthly income: ${formatCurrency(data.monthlyIncome)}`;
};

const loadIncomeStatus = async () => {
  const status = await fetchWithToken("/api/income/status");
  if (status.hasMonthlyIncome) {
    setIncomeVisibility({ showVerification: false, showStrategy: true });
    await loadIncomeStrategy();
  } else {
    setIncomeVisibility({ showVerification: true, showStrategy: false });
  }
};

const handleSubmit = (form, endpoint) => async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  updateOutput("Request in progress...");

  try {
    const data = await postJson(endpoint, payload);
    storeToken(data.token);
    updateOutput(formatJson(data));
    await loadIncomeStatus();
  } catch (error) {
    updateOutput(`Error: ${error.message}`);
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

clearTokenButton.addEventListener("click", clearToken);

incomeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(incomeForm);
  const payload = Object.fromEntries(formData.entries());
  updateOutput("Saving monthly income...");
  try {
    await fetchWithToken("/api/income", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await loadIncomeStatus();
    updateOutput("Monthly income saved. Strategy unlocked.");
    incomeForm.reset();
  } catch (error) {
    updateOutput(`Error: ${error.message}`);
  }
});

const existingToken = localStorage.getItem(TOKEN_KEY);
if (existingToken) {
  updateOutput(`Existing token found:\n${existingToken}`);
  loadIncomeStatus().catch((error) => {
    updateOutput(`Error: ${error.message}`);
  });
}
