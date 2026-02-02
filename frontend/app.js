const API_BASE = "http://localhost:8080";
const TOKEN_KEY = "incomeManagerToken";

// --- Shared Utilities ---
const getToken = () => localStorage.getItem(TOKEN_KEY);

const formatCurrency = (val) => {
    return new Intl.NumberFormat('az-AZ', {
        style: 'currency', 
        currency: 'AZN'
    }).format(val);
};

const request = async (endpoint, method = "GET", body = null) => {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || "Xəta baş verdi");
    return data;
};

const showMessage = (msg, type = "error") => {
    const box = document.getElementById("messageBox");
    if (!box) return alert(msg);
    box.textContent = msg;
    box.className = `message ${type}`;
    box.classList.remove("hidden");
    setTimeout(() => box.classList.add("hidden"), 3000);
};

// --- Auth Page Logic (index.html) ---
function switchAuth(type) {
    document.getElementById("loginForm").classList.toggle("active", type === 'login');
    document.getElementById("registerForm").classList.toggle("active", type === 'register');
    
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
}

if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target));
        try {
            const data = await request("/api/auth/login", "POST", payload);
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem("userFullName", data.fullName);
            window.location.href = "dashboard.html";
        } catch (err) {
            showMessage("Giriş uğursuz oldu: " + err.message);
        }
    });

    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target));
        try {
            const data = await request("/api/auth/register", "POST", payload);
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem("userFullName", data.fullName);
            window.location.href = "dashboard.html";
        } catch (err) {
            showMessage("Qeydiyyat xətası: " + err.message);
        }
    });
}

// --- Dashboard Logic (dashboard.html) ---
async function initDashboard() {
    const token = getToken();
    if (!token) return window.location.href = "index.html";

    // Set user name
    const name = localStorage.getItem("userFullName") || "İstifadəçi";
    document.getElementById("userNameDisplay").textContent = name;

    try {
        const status = await request("/api/income/status");
        document.getElementById("loader").classList.add("hidden");
        
        if (status.hasMonthlyIncome) {
            loadStrategy();
        } else {
            document.getElementById("incomeSection").classList.remove("hidden");
        }
    } catch (err) {
        if (err.message.includes("403")) logout();
    }
}

async function loadStrategy() {
    try {
        const data = await request("/api/income/strategy");
        
        document.getElementById("fixedAmount").textContent = formatCurrency(data.fixedAndEssential);
        document.getElementById("growthAmount").textContent = formatCurrency(data.growthAndReinvestment);
        document.getElementById("personalAmount").textContent = formatCurrency(data.personalWants);
        document.getElementById("totalIncomeDisplay").textContent = formatCurrency(data.monthlyIncome);

        document.getElementById("incomeSection").classList.add("hidden");
        document.getElementById("strategySection").classList.remove("hidden");
    } catch (err) {
        console.error(err);
    }
}

// Handle Income Submission
if (document.getElementById("incomeForm")) {
    document.getElementById("incomeForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target));
        
        try {
            await request("/api/income", "POST", payload);
            loadStrategy();
        } catch (err) {
            alert(err.message);
        }
    });
}

function resetIncome() {
    document.getElementById("strategySection").classList.add("hidden");
    document.getElementById("incomeSection").classList.remove("hidden");
    document.querySelector("input[name='monthlyIncome']").value = "";
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("userFullName");
    window.location.href = "index.html";
}