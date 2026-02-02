const output = document.getElementById("output");
const apiBaseInput = document.getElementById("apiBase");
const clearTokenButton = document.getElementById("clearToken");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

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

const handleSubmit = (form, endpoint) => async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  updateOutput("Request in progress...");

  try {
    const data = await postJson(endpoint, payload);
    storeToken(data.token);
    updateOutput(formatJson(data));
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

const existingToken = localStorage.getItem(TOKEN_KEY);
if (existingToken) {
  updateOutput(`Existing token found:\n${existingToken}`);
}
