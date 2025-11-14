import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://knevyndevlqitezbsefi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZXZ5bmRldmxxaXRlemJzZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgzOTYsImV4cCI6MjA3ODY4NDM5Nn0.p_a9l4YNTUUCgUsZbQN03DIiRBjl7_oR3h7S9gCFKSk";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ELEMENTI
const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");
const adminArea = document.getElementById("admin-area");
const roleSpan = document.getElementById("role");
const companyList = document.getElementById("company-list");
const aziendeSection = document.getElementById("aziende-section");

const companyDetail = document.getElementById("company-detail");
const detailName = document.getElementById("detail-name");
const detailCity = document.getElementById("detail-city");
const detailPhone = document.getElementById("detail-phone");
const detailEmail = document.getElementById("detail-email");
const closeDetailBtn = document.getElementById("close-detail");

const filterInput = document.getElementById("filter-input");

// MENU NAV
document.getElementById("menu-dashboard").onclick = () => {
  dashboard.style.display = "block";
  aziendeSection.style.display = "none";
};
document.getElementById("menu-aziende").onclick = () => {
  dashboard.style.display = "none";
  aziendeSection.style.display = "block";
};
document.getElementById("menu-logout").onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

// LOGIN
document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { alert(error.message); return; }

  const session = data.session;
  if (!session) { alert("Errore nella sessione"); return; }

  // Appena login, mostra subito la pagina Aziende
  await init(session.user);
  dashboard.style.display = "none";
  aziendeSection.style.display = "block";
};

// CREA AGENTE
document.getElementById("create-agent-btn").onclick = async () => {
  const email = document.getElementById("agent-email").value;
  const password = document.getElementById("agent-pass").value;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return alert(error.message);
  await supabase.from("profiles").insert({ id: data.user.id, role: "agent" });
  alert("Agente creato");
};

// AGGIUNGI AZIENDA
document.getElementById("add-company").onclick = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const name = document.getElementById("c-name").value;
  const phone = document.getElementById("c-phone").value;
  const email = document.getElementById("c-email").value;
  const city = document.getElementById("c-city").value;

  await supabase.from("companies").insert({ user_id: user.id, name, phone, email, city });
  await loadCompanies();
};

// CHIUDI DETTAGLIO
closeDetailBtn.onclick = () => {
  companyDetail.style.display = "none";
};

// FILTRO
filterInput.addEventListener("input", () => {
  const term = filterInput.value.toLowerCase();
  const cards = companyList.querySelectorAll(".company-card");
  cards.forEach(card => {
    const name = card.querySelector("h4").innerText.toLowerCase();
    const city = card.querySelector("p strong").nextSibling.textContent.toLowerCase();
    card.style.display = (name.includes(term) || city.includes(term)) ? "block" : "none";
  });
});

// CARICA AZIENDE
async function loadCompanies() {
  const { data, error } = await supabase.from("companies").select("*");
  if (error) { console.log(error); return; }

  data.sort((a, b) => a.name.localeCompare(b.name));
  companyList.innerHTML = "";

  data.forEach(c => {
    const div = document.createElement("div");
    div.className = "company-card";
    div.innerHTML = `
      <h4>${c.name}</h4>
      <p><strong>Città:</strong> ${c.city}</p>
      <p><strong>Telefono:</strong> ${c.phone}</p>
      <p><strong>Email:</strong> ${c.email}</p>
    `;
    div.onclick = () => {
      detailName.innerText = c.name;
      detailCity.innerText = c.city;
      detailPhone.innerText = c.phone;
      detailEmail.innerText = c.email;
      companyDetail.style.display = "block";
      companyDetail.scrollIntoView({ behavior: "smooth" });
    };
    companyList.appendChild(div);
  });
}

// INIT
async function init(user) {
  loginSection.style.display = "none";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  roleSpan.innerText = "Ruolo: " + profile.role;
  if (profile.role === "admin") adminArea.style.display = "block";

  await loadCompanies(); // carica subito le aziende
}
