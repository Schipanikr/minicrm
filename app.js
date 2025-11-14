import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Dati Supabase forniti
const SUPABASE_URL = "https://knevyndevlqitezbsefi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZXZ5bmRldmxxaXRlemJzZWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDgzOTYsImV4cCI6MjA3ODY4NDM5Nn0.p_a9l4YNTUUCgUsZbQN03DIiRBjl7_oR3h7S9gCFKSk";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ELEMENTI
const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");
const companyList = document.getElementById("company-list");
const adminArea = document.getElementById("admin-area");
const roleSpan = document.getElementById("role");

// LOGIN
document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) { alert(error.message); return; }

  init();
};

// LOGOUT
document.getElementById("logout-btn").onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

// CREA AGENTE (solo admin)
document.getElementById("create-agent-btn").onclick = async () => {
  const email = document.getElementById("agent-email").value;
  const pass = document.getElementById("agent-pass").value;

  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) return alert(error.message);

  await supabase.from("profiles").insert({
    id: data.user.id,
    role: "agent"
  });

  alert("Agente creato");
};

// AGGIUNGI AZIENDA
document.getElementById("add-company").onclick = async () => {
  const { data: user } = await supabase.auth.getUser();

  const name = document.getElementById("c-name").value;
  const phone = document.getElementById("c-phone").value;
  const email = document.getElementById("c-email").value;
  const city = document.getElementById("c-city").value;

  await supabase.from("companies").insert({
    user_id: user.user.id,
    name,
    phone,
    email,
    city
  });

  loadCompanies();
};

// CARICA AZIENDE
async function loadCompanies() {
  const { data, error } = await supabase.from("companies").select("*");
  if (error) return;

  companyList.innerHTML = "";
  data.forEach(c =>
    companyList.innerHTML += `<li>${c.name} – ${c.city} – ${c.phone} – ${c.email}</li>`
  );
}

// INIT
async function init() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return;

  loginSection.style.display = "none";
  dashboard.style.display = "block";

  const user = session.session.user;

  // prendi ruolo utente
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  roleSpan.innerText = "Ruolo: " + profile.role;

  if (profile.role === "admin") {
    adminArea.style.display = "block";
  }

  loadCompanies();
}

init();
