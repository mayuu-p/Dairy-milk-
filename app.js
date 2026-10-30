(() => {
  "use strict";

  const STORE_KEY = "dairy-milk-ledger.v1";
  const LISTS = ["cows", "milk", "expenses", "workers", "buyers", "payments"];
  const ROUTES = [
    ["dashboard", "⌂", "Overview"],
    ["cows", "◉", "Animals"],
    ["milk", "◌", "Milk log"],
    ["expenses", "↘", "Farm costs"],
    ["workers", "♙", "Team"],
    ["buyers", "⇄", "Buyers"],
    ["payments", "₹", "Cashbook"],
    ["reports", "▤", "Reports"],
    ["settings", "⚙", "Farm setup"]
  ];
  const WORDS = {
    en: {
      dashboard: "Overview", cows: "Animals", milk: "Milk log", expenses: "Farm costs",
      workers: "Team", buyers: "Buyers", payments: "Cashbook", reports: "Reports",
      settings: "Farm setup", today: "TODAY ON YOUR FARM", welcome: "A clear view of your dairy.",
      cowsTotal: "Animals", milkToday: "Milk today", monthCost: "Costs this month",
      activeBuyers: "Active buyers", quick: "Quick entry", quickHint: "Log the day as it happens.",
      recentMilk: "Latest milk records", recentCosts: "Latest farm costs", weekTrend: "Last 7 days",
      milkTrend: "Milk collected each day", add: "Add record", share: "Share summary",
      print: "Save as PDF", export: "Download CSV", cancel: "Cancel", save: "Save record",
      edit: "Edit", remove: "Remove", noData: "Nothing recorded here yet.",
      private: "Private to this browser", privateHint: "Your farm data stays on this device.",
      farmSetup: "Set up your farm", setupHint: "A new, independent ledger for your dairy.",
      farmSetupText: "No account, cloud sync, or connection to another dairy app. Your records stay in this browser.",
      farmName: "Farm name", owner: "Owner name", phone: "Phone", location: "Village / location",
      start: "Open my ledger", language: "Language", perLitre: "Milk rate per litre",
      backup: "Download backup", restore: "Restore backup", localWarning: "Keep a backup: this ledger is stored only in this browser. Clearing browser data removes it.",
      currentMonth: "This month", lifetime: "All-time", collection: "Milk collected",
      revenue: "Milk value", expensesTotal: "Recorded costs", net: "Milk value less farm costs",
      income: "Income", expense: "Expense", activeWorkers: "Active team members",
      search: "Search records…", all: "All records", records: "records", noMatch: "No records match this search."
    },
    hi: {
      dashboard: "झलक", cows: "पशु", milk: "दूध हिसाब", expenses: "खेत खर्च",
      workers: "टीम", buyers: "खरीदार", payments: "लेन-देन", reports: "रिपोर्ट",
      settings: "खेत सेटअप", today: "आज के खेत का हाल", welcome: "डेयरी का साफ़ हिसाब।",
      cowsTotal: "कुल पशु", milkToday: "आज का दूध", monthCost: "इस महीने का खर्च",
      activeBuyers: "चालू खरीदार", quick: "झटपट एंट्री", quickHint: "काम के साथ हिसाब लिखें।",
      recentMilk: "हाल की दूध एंट्री", recentCosts: "हाल के खेत खर्च", weekTrend: "पिछले 7 दिन",
      milkTrend: "हर दिन का दूध", add: "रिकॉर्ड जोड़ें", share: "सारांश साझा करें",
      print: "PDF के रूप में सहेजें", export: "CSV डाउनलोड", cancel: "रद्द करें", save: "रिकॉर्ड सहेजें",
      edit: "बदलें", remove: "हटाएँ", noData: "अभी यहाँ कोई रिकॉर्ड नहीं है।",
      private: "इसी ब्राउज़र में निजी", privateHint: "खेत का डेटा इसी डिवाइस पर रहता है।",
      farmSetup: "खेत सेट करें", setupHint: "आपकी डेयरी के लिए नया, अलग हिसाब।",
      farmSetupText: "कोई खाता, क्लाउड सिंक या दूसरे डेयरी ऐप से जुड़ाव नहीं। रिकॉर्ड इसी ब्राउज़र में रहेंगे।",
      farmName: "खेत का नाम", owner: "मालिक का नाम", phone: "फोन", location: "गाँव / जगह",
      start: "मेरा हिसाब खोलें", language: "भाषा", perLitre: "दूध का प्रति लीटर भाव",
      backup: "बैकअप डाउनलोड", restore: "बैकअप वापस डालें", localWarning: "बैकअप रखें: यह हिसाब सिर्फ इसी ब्राउज़र में सहेजा जाता है। ब्राउज़र डेटा साफ़ करने पर रिकॉर्ड मिट सकते हैं।",
      currentMonth: "इस महीने", lifetime: "अब तक", collection: "कुल दूध",
      revenue: "दूध की कीमत", expensesTotal: "दर्ज खर्च", net: "दूध कीमत घटा खेत खर्च",
      income: "आमदनी", expense: "खर्च", activeWorkers: "सक्रिय टीम सदस्य",
      search: "रिकॉर्ड खोजें…", all: "सभी रिकॉर्ड", records: "रिकॉर्ड", noMatch: "खोज से कोई रिकॉर्ड नहीं मिला।"
    }
  };
  const BREEDS = ["Gir", "Sahiwal", "Jersey", "Holstein Friesian", "Red Sindhi", "Tharparkar", "Rathi", "Hariana", "Ongole", "Crossbred", "Other"];
  const COST_TYPES = [
    ["feed", "Feed & fodder"], ["medical", "Veterinary"], ["labour", "Labour"],
    ["transport", "Transport"], ["utilities", "Utilities"], ["maintenance", "Maintenance"], ["other", "Other"]
  ];

  let db;
  let route = "dashboard";
  let modal = null;
  let search = "";
  let toastTimer;
  const app = document.getElementById("app");
  const t = (key) => (WORDS[db?.language] || WORDS.en)[key] || key;
  const today = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const money = (value) => new Intl.NumberFormat(db?.language === "hi" ? "en-IN" : "en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(Number(value) || 0);
  const fmtDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(db?.language === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric", month: "short", year: "numeric"
  }) : "—";
  const sum = (rows, field) => rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
  const freshDb = () => ({
    farm: null, language: "en", rate: 35,
    cows: [], milk: [], expenses: [], workers: [], buyers: [], payments: []
  });

  function loadDb() {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshDb();
    const parsed = JSON.parse(raw);
    const next = freshDb();
    if (!parsed || typeof parsed !== "object") throw new Error("Stored farm data has an invalid format.");
    next.farm = parsed.farm && typeof parsed.farm === "object" ? parsed.farm : null;
    next.language = parsed.language === "hi" ? "hi" : "en";
    next.rate = Number.isFinite(Number(parsed.rate)) && Number(parsed.rate) >= 0 ? Number(parsed.rate) : 35;
    for (const key of LISTS) next[key] = Array.isArray(parsed[key]) ? parsed[key] : [];
    return next;
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      return true;
    } catch (error) {
      console.error("Could not save the local farm ledger.", error);
      showToast("Could not save. Check device storage and download a backup.", true);
      return false;
    }
  }

  function showToast(message, error = false) {
    document.querySelector(".toast")?.remove();
    const node = document.createElement("div");
    node.className = `toast${error ? " error" : ""}`;
    node.setAttribute("role", "status");
    node.textContent = message;
    document.body.append(node);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.remove(), 3400);
  }

  function pageTitle() {
    const routeInfo = ROUTES.find(([key]) => key === route);
    return routeInfo ? t(keyForRoute(routeInfo[0])) : t("dashboard");
  }

  function keyForRoute(key) {
    return ({ dashboard: "dashboard", cows: "cows", milk: "milk", expenses: "expenses",
      workers: "workers", buyers: "buyers", payments: "payments", reports: "reports", settings: "settings" })[key];
  }

  function render() {
    document.documentElement.lang = db?.language === "hi" ? "hi" : "en";
    if (!db.farm) {
      app.innerHTML = renderSetup();
      return;
    }
    const activeElement = document.activeElement;
    const focusId = activeElement?.id;
    const selection = activeElement && "selectionStart" in activeElement ? activeElement.selectionStart : null;
    app.innerHTML = `
      <div class="shell">
        <aside class="rail" id="rail">
          <div class="brand"><span class="brand-mark">M</span><div><div class="brand-name">MilkLedger</div><div class="brand-caption">Dairy Milk</div></div></div>
          <div class="nav-caption">Farm desk</div>
          <nav class="nav-list" aria-label="Farm sections">
            ${ROUTES.map(([key, icon]) => `<button class="nav-item${route === key ? " active" : ""}" type="button" data-action="route" data-value="${key}"><span class="nav-icon" aria-hidden="true">${icon}</span><span>${t(keyForRoute(key))}</span></button>`).join("")}
          </nav>
          <div class="rail-foot"><span class="private-dot"></span>${t("private")}<br>${t("privateHint")}</div>
        </aside>
        <main class="main">
          <header class="topbar">
            <div style="display:flex;align-items:center">
              <button class="icon-button mobile-menu" type="button" aria-label="Open menu" data-action="menu">☰</button>
              <div><div class="crumb">MilkLedger / Farm desk</div><div class="page-heading">${esc(pageTitle())}</div></div>
            </div>
            <div class="top-actions">
              <button class="button soft small" type="button" data-action="language">${db.language === "en" ? "हिन्दी" : "English"}</button>
              <div class="farm-chip"><span class="farm-avatar">${esc((db.farm.name || "M").slice(0, 1).toUpperCase())}</span><span class="farm-name">${esc(db.farm.name)}</span></div>
            </div>
          </header>
          <section class="content">${renderPage()}</section>
        </main>
      </div>
      ${modal ? renderModal() : ""}
    `;
    if (focusId) {
      const newFocus = document.getElementById(focusId);
      newFocus?.focus();
      if (selection !== null && newFocus && "setSelectionRange" in newFocus) newFocus.setSelectionRange(selection, selection);
    }
  }

  function renderSetup() {
    return `<main class="onboard">
      <section class="onboard-card">
        <header class="onboard-banner"><span class="brand-mark">M</span><div><h1>MilkLedger</h1><p>Dairy Milk · a fresh start for your farm</p></div></header>
        <div class="onboard-content">
          <div class="eyebrow">${t("setupHint")}</div><h1>${t("farmSetup")}</h1>
          <p>${t("farmSetupText")}</p>
          <form class="onboard-form" data-form="setup">
            <label class="form-group"><span class="form-label">${t("farmName")} *</span><input class="field" name="name" maxlength="70" required placeholder="e.g. Green Meadow Dairy"></label>
            <label class="form-group"><span class="form-label">${t("owner")} *</span><input class="field" name="owner" maxlength="70" required></label>
            <label class="form-group"><span class="form-label">${t("phone")}</span><input class="field" name="phone" type="tel" maxlength="25"></label>
            <label class="form-group"><span class="form-label">${t("location")}</span><input class="field" name="location" maxlength="100"></label>
            <label class="form-group full"><span class="form-label">${t("language")}</span><select class="field" name="language"><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
            <button class="button primary full" type="submit">${t("start")} <span aria-hidden="true">→</span></button>
          </form>
          <div class="privacy-note"><span class="private-dot"></span>${t("localWarning")}</div>
        </div>
      </section>
    </main>`;
  }

  function renderPage() {
    const pages = {
      dashboard: renderDashboard, cows: renderCows, milk: renderMilk, expenses: renderExpenses,
      workers: renderWorkers, buyers: renderBuyers, payments: renderPayments, reports: renderReports, settings: renderSettings
    };
    return (pages[route] || pages.dashboard)();
  }

  function pageHeader(title, subtitle, action = "") {
    return `<div class="section-head"><div><h1 class="section-title">${esc(title)}</h1><p class="section-sub">${esc(subtitle)}</p></div>${action}</div>`;
  }

  function statCard(icon, label, value, note = "", tone = "") {
    return `<article class="stat-card"><span class="stat-icon ${tone}">${icon}</span><div><div class="stat-label">${esc(label)}</div><div class="stat-value">${esc(value)}</div><div class="stat-note">${esc(note)}</div></div></article>`;
  }

  function actionButton(type, label) {
    const config = {
      cow: ["🐄", "cows"], milk: ["🥛", "milk"], expense: ["🧾", "expenses"],
      worker: ["👩‍🌾", "workers"], buyer: ["🤝", "buyers"], payment: ["₹", "payments"]
    }[type];
    return `<button class="quick-action" type="button" data-action="new" data-value="${type}"><span class="quick-symbol">${config[0]}</span><span><strong>${esc(label)}</strong><small>${t("add")}</small></span></button>`;
  }

  function renderDashboard() {
    const date = today();
    const month = date.slice(0, 7);
    const todayMilk = sum(db.milk.filter((entry) => entry.date === date), "litres");
    const todayIncome = sum(db.payments.filter((entry) => entry.date === date && entry.type === "income"), "amount");
    const monthCosts = sum(db.expenses.filter((entry) => entry.date?.startsWith(month)), "amount");
    const healthy = db.cows.filter((cow) => cow.health === "Healthy").length;
    const weekly = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const litres = sum(db.milk.filter((entry) => entry.date === key), "litres");
      return { key, litres, label: day.toLocaleDateString(db.language === "hi" ? "hi-IN" : "en-IN", { weekday: "short" }) };
    });
    const max = Math.max(1, ...weekly.map((day) => day.litres));
    const recent = [...db.milk].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    return `<div class="welcome"><div><div class="eyebrow">${t("today")}</div><h1>${t("welcome")}</h1><p>${esc(db.farm.name)} · ${esc(db.farm.location || db.farm.owner)}</p></div><div class="date-pill">${fmtDate(date)}</div></div>
      <div class="grid stats-grid">
        ${statCard("🐄", t("cowsTotal"), db.cows.length, `${healthy} healthy`)}
        ${statCard("🥛", t("milkToday"), `${todayMilk.toFixed(1)} L`, `${db.milk.filter((entry) => entry.date === date).length} entries`, "gold")}
        ${statCard("🧾", t("monthCost"), money(monthCosts), t("currentMonth"), "coral")}
        ${statCard("₹", t("income"), money(todayIncome), fmtDate(date), "blue")}
      </div>
      <div class="grid overview-grid">
        <article class="panel"><div class="panel-head"><div><h2 class="panel-title">${t("weekTrend")}</h2><div class="panel-hint">${t("milkTrend")} · litres</div></div><span class="badge">${weekly.reduce((n, day) => n + day.litres, 0).toFixed(1)} L</span></div>
          <div class="panel-body"><div class="chart" role="img" aria-label="${esc(t("milkTrend"))}">${weekly.map((day) => `<div class="chart-col"><div class="chart-bar" title="${day.litres.toFixed(1)} L" style="height:${Math.max(3, day.litres / max * 100)}%"></div><span class="chart-label">${esc(day.label)}</span></div>`).join("")}</div></div></article>
        <article class="panel"><div class="panel-head"><div><h2 class="panel-title">${t("quick")}</h2><div class="panel-hint">${t("quickHint")}</div></div></div><div class="panel-body"><div class="quick-grid">${actionButton("milk", "Milk")}${actionButton("expense", "Farm cost")}${actionButton("cow", "Animal")}${actionButton("payment", "Cashbook")}</div></div></article>
      </div>
      <div class="grid overview-grid">
        <article class="panel"><div class="panel-head"><div><h2 class="panel-title">${t("recentMilk")}</h2><div class="panel-hint">${db.milk.length} ${t("records")}</div></div><button class="button soft small" data-action="route" data-value="milk">${t("milk")} →</button></div><div class="panel-body">${recent.length ? `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Animal</th><th>Session</th><th>Litres</th><th>Value</th></tr></thead><tbody>${recent.map((entry) => `<tr><td>${fmtDate(entry.date)}</td><td>${esc(animalName(entry.cowId))}</td><td>${esc(entry.session)}</td><td>${Number(entry.litres).toFixed(1)} L</td><td class="money">${money(entry.total)}</td></tr>`).join("")}</tbody></table></div>` : emptyState("🥛", t("noData"), "Add a milk record to see the collection trend.")}</div></article>
        <article class="panel"><div class="panel-head"><div><h2 class="panel-title">${t("recentCosts")}</h2><div class="panel-hint">${db.expenses.length} ${t("records")}</div></div><button class="button soft small" data-action="route" data-value="expenses">${t("expenses")} →</button></div><div class="panel-body">${db.expenses.length ? [...db.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((entry) => `<div class="summary-row"><span>${esc(entry.description)}<br><small>${fmtDate(entry.date)}</small></span><strong class="money">${money(entry.amount)}</strong></div>`).join("") : emptyState("🧾", t("noData"), "Add a farm cost when you are ready.")}</div></article>
      </div>`;
  }

  function emptyState(icon, title, detail, action = "") {
    return `<div class="empty"><span class="empty-mark">${icon}</span><h3>${esc(title)}</h3><p>${esc(detail)}</p>${action}</div>`;
  }

  function animalName(cowId) {
    if (!cowId || cowId === "all") return "Whole herd";
    return db.cows.find((cow) => cow.id === cowId)?.name || "Removed animal";
  }

  function searchBox() {
    return `<label class="search"><input id="record-search" class="field" type="search" value="${esc(search)}" placeholder="${t("search")}" aria-label="${t("search")}"></label>`;
  }

  function recordActions(type, key) {
    return `<span class="row-actions"><button class="button soft small" type="button" data-action="edit" data-type="${type}" data-id="${esc(key)}">${t("edit")}</button><button class="button soft small" type="button" data-action="delete" data-type="${type}" data-id="${esc(key)}">${t("remove")}</button></span>`;
  }

  function filterRows(rows, values) {
    const needle = search.trim().toLocaleLowerCase();
    return needle ? rows.filter((row) => values(row).some((value) => String(value ?? "").toLocaleLowerCase().includes(needle))) : rows;
  }

  function renderCows() {
    const rows = filterRows(db.cows, (cow) => [cow.name, cow.tag, cow.breed, cow.health, cow.stage, cow.notes]);
    const cards = rows.map((cow) => {
      const due = cow.deliveryDate ? Math.ceil((new Date(`${cow.deliveryDate}T00:00:00`) - new Date(`${today()}T00:00:00`)) / 86400000) : null;
      const healthClass = cow.health === "Healthy" ? "" : cow.health === "Sick" ? "danger" : "warn";
      return `<article class="record-card"><div class="record-top"><div><div class="record-name">${esc(cow.name)}</div><div class="record-tag">Tag ${esc(cow.tag || "—")} · ${esc(cow.breed || "Breed not set")}</div></div><div>${recordActions("cow", cow.id)}</div></div>
        <div class="record-line"><span>Health</span><span class="badge ${healthClass}">${esc(cow.health || "Healthy")}</span></div>
        <div class="record-line"><span>Color</span><strong>${esc(cow.color || "—")}</strong></div>
        <div class="record-line"><span>Lactation</span><strong>${esc(cow.stage || "—")}</strong></div>
        <div class="record-line"><span>Production</span><strong>${esc(cow.production || "—")}</strong></div>
        <div class="record-line"><span>Health check</span><strong>${fmtDate(cow.checkup)}</strong></div>
        <div class="record-line"><span>Milk yield</span><strong>${esc(cow.yield || "—")}</strong></div>
        ${cow.health === "Pregnant" && cow.deliveryDate ? `<div class="record-line"><span>Expected calving</span><strong>${fmtDate(cow.deliveryDate)} · ${due <= 0 ? "due" : `${due} days`}</strong></div>` : ""}
        ${cow.notes ? `<div class="secondary-text">${esc(cow.notes)}</div>` : ""}
      </article>`;
    }).join("");
    return `${pageHeader(t("cows"), "Keep animal details, health and calving dates in one place.", `<button class="button primary" data-action="new" data-value="cow">＋ ${t("add")}</button>`)}
      <div class="toolbar">${searchBox()}<span class="badge">${rows.length} ${t("records")}</span></div>
      ${cards ? `<div class="record-grid">${cards}</div>` : emptyState("🐄", search ? t("noMatch") : t("noData"), "Add an animal with a tag, breed and health status.", `<button class="button primary" data-action="new" data-value="cow">＋ Add animal</button>`)}`;
  }

  function tablePanel(headers, rows, emptyIcon, emptyText) {
    return `<article class="panel"><div class="panel-body">${rows.length ? `<div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>` : emptyState(emptyIcon, search ? t("noMatch") : t("noData"), emptyText)}</div></article>`;
  }

  function renderMilk() {
    const rows = filterRows(db.milk, (entry) => [entry.date, entry.session, entry.litres, entry.fat, entry.snf, entry.notes, animalName(entry.cowId)])
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((entry) => `<tr><td>${fmtDate(entry.date)}</td><td>${esc(animalName(entry.cowId))}</td><td><span class="badge">${esc(entry.session)}</span></td><td>${Number(entry.litres).toFixed(1)} L</td><td>${esc(entry.fat || "—")}%</td><td>${esc(entry.snf || "—")}%</td><td class="money">${money(entry.rate)}/L</td><td class="money">${money(entry.total)}</td><td>${recordActions("milk", entry.id)}</td></tr>`);
    return `${pageHeader(t("milk"), "Morning and evening collection, quality and milk value.", `<button class="button primary" data-action="new" data-value="milk">＋ ${t("add")}</button>`)}
      <div class="toolbar">${searchBox()}<span class="badge">${rows.length} ${t("records")}</span></div>
      ${tablePanel(["Date", "Animal", "Session", "Collected", "Fat", "SNF", "Rate", "Value", "Actions"], rows, "🥛", "Start logging milk by animal and milking session.")}`;
  }

  function renderExpenses() {
    const filtered = filterRows(db.expenses, (entry) => [entry.date, entry.category, entry.description, entry.vendor, entry.amount]);
    const rows = filtered.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => `<tr><td>${fmtDate(entry.date)}</td><td><span class="badge warn">${esc(labelFor(COST_TYPES, entry.category))}</span></td><td>${esc(entry.description)}</td><td>${esc(entry.vendor || "—")}</td><td class="money">${money(entry.amount)}</td><td>${recordActions("expense", entry.id)}</td></tr>`);
    const total = sum(db.expenses, "amount");
    return `${pageHeader(t("expenses"), "Track feed, veterinary bills, labour and everyday farm costs.", `<button class="button primary" data-action="new" data-value="expense">＋ ${t("add")}</button>`)}
      <div class="grid kpi-grid"><article class="panel kpi"><span>${t("lifetime")}</span><strong>${money(total)}</strong><span>${db.expenses.length} records</span></article>${COST_TYPES.slice(0, 2).map(([key, label]) => `<article class="panel kpi"><span>${esc(label)}</span><strong>${money(sum(db.expenses.filter((entry) => entry.category === key), "amount"))}</strong><span>${db.expenses.filter((entry) => entry.category === key).length} records</span></article>`).join("")}</div>
      <div class="toolbar">${searchBox()}<span class="badge">${rows.length} ${t("records")}</span></div>
      ${tablePanel(["Date", "Category", "Description", "Paid to", "Amount", "Actions"], rows, "🧾", "Record the costs that keep your farm running.")}`;
  }

  function renderWorkers() {
    const rows = filterRows(db.workers, (worker) => [worker.name, worker.phone, worker.role, worker.dailyWage, worker.hourlyWage]);
    const cards = rows.map((worker) => `<article class="record-card"><div class="record-top"><div><div class="record-name">${esc(worker.name)}</div><div class="record-tag">${esc(worker.role || "Farm team")} · ${esc(worker.phone || "No phone")}</div></div><div>${recordActions("worker", worker.id)}</div></div>
      <div class="record-line"><span>Daily wage</span><strong>${money(worker.dailyWage)}</strong></div><div class="record-line"><span>Hourly wage</span><strong>${money(worker.hourlyWage)}</strong></div>
      <div class="record-line"><span>Status</span><span class="badge ${worker.active === false ? "danger" : ""}">${worker.active === false ? "Inactive" : "Active"}</span></div></article>`).join("");
    return `${pageHeader(t("workers"), "Keep worker contacts, roles and agreed wages close at hand.", `<button class="button primary" data-action="new" data-value="worker">＋ ${t("add")}</button>`)}
      <div class="toolbar">${searchBox()}<span class="badge">${rows.length} ${t("records")}</span></div>
      ${cards ? `<div class="record-grid">${cards}</div>` : emptyState("👩‍🌾", search ? t("noMatch") : t("noData"), "Add the people who help care for your herd.", `<button class="button primary" data-action="new" data-value="worker">＋ Add team member</button>`)}`;
  }

  function renderBuyers() {
    const rows = filterRows(db.buyers, (buyer) => [buyer.name, buyer.company, buyer.phone, buyer.email, buyer.rate, buyer.terms]);
    const entries = rows.map((buyer) => `<tr><td><div class="row-name">${esc(buyer.name)}</div><div class="secondary-text">${esc(buyer.company || "Independent buyer")}</div></td><td>${esc(buyer.phone || "—")}</td><td class="money">${money(buyer.rate)}/L</td><td>${esc(buyer.contract || "Fixed")}</td><td><span class="badge ${buyer.active === false ? "danger" : ""}">${buyer.active === false ? "Inactive" : "Active"}</span></td><td>${recordActions("buyer", buyer.id)}</td></tr>`);
    return `${pageHeader(t("buyers"), "Manage milk purchasers, contact details, rates and contract notes.", `<button class="button primary" data-action="new" data-value="buyer">＋ ${t("add")}</button>`)}
      <div class="toolbar">${searchBox()}<span class="badge">${rows.length} ${t("records")}</span></div>
      ${tablePanel(["Buyer", "Phone", "Rate per litre", "Contract", "Status", "Actions"], entries, "🤝", "Add the people and businesses that buy your milk.")}`;
  }

  function renderPayments() {
    const totalIncome = sum(db.payments.filter((entry) => entry.type === "income"), "amount");
    const totalExpense = sum(db.payments.filter((entry) => entry.type === "expense"), "amount");
    const rows = filterRows(db.payments, (entry) => [entry.date, entry.type, entry.party, entry.mode, entry.invoice, entry.notes])
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((entry) => `<tr><td>${fmtDate(entry.date)}</td><td><span class="badge ${entry.type === "expense" ? "danger" : ""}">${esc(entry.type)}</span></td><td>${esc(entry.party)}</td><td>${esc(entry.mode)}</td><td class="money">${entry.type === "expense" ? "−" : "+"}${money(entry.amount)}</td><td>${esc(entry.invoice || "—")}</td><td>${recordActions("payment", entry.id)}</td></tr>`);
    return `${pageHeader(t("payments"), "A separate cashbook for money received and money paid.", `<button class="button primary" data-action="new" data-value="payment">＋ ${t("add")}</button>`)}
      <div class="grid kpi-grid"><article class="panel kpi"><span>${t("income")}</span><strong>${money(totalIncome)}</strong></article><article class="panel kpi"><span>${t("expense")}</span><strong>${money(totalExpense)}</strong></article><article class="panel kpi"><span>Balance</span><strong>${money(totalIncome - totalExpense)}</strong></article></div>
      <div class="toolbar">${searchBox()}<span class="badge">${rows.length} ${t("records")}</span></div>
      ${tablePanel(["Date", "Type", "To / from", "Mode", "Amount", "Reference", "Actions"], rows, "₹", "Record payments, receipts and references.")}`;
  }

  function renderReports() {
    const month = today().slice(0, 7);
    const monthMilk = db.milk.filter((entry) => entry.date?.startsWith(month));
    const monthCosts = db.expenses.filter((entry) => entry.date?.startsWith(month));
    const totalMilk = sum(monthMilk, "litres");
    const milkValue = sum(monthMilk, "total");
    const costValue = sum(monthCosts, "amount");
    const daily = [...new Set(monthMilk.map((entry) => entry.date))].sort().reverse().slice(0, 12);
    const rows = daily.map((date) => {
      const dayMilk = monthMilk.filter((entry) => entry.date === date);
      const litres = sum(dayMilk, "litres");
      return `<tr><td>${fmtDate(date)}</td><td>${dayMilk.length}</td><td>${litres.toFixed(1)} L</td><td class="money">${money(sum(dayMilk, "total"))}</td></tr>`;
    });
    return `${pageHeader(t("reports"), "A quick read on this month’s milk output and farm spending.", `<button class="button soft" data-action="print">${t("print")}</button><button class="button primary" data-action="csv">${t("export")}</button><button class="button soft" data-action="share">${t("share")}</button>`)}
      <div class="grid kpi-grid"><article class="panel kpi"><span>${t("collection")}</span><strong>${totalMilk.toFixed(1)} L</strong><span>${t("currentMonth")}</span></article><article class="panel kpi"><span>${t("revenue")}</span><strong>${money(milkValue)}</strong><span>${t("currentMonth")}</span></article><article class="panel kpi"><span>${t("expensesTotal")}</span><strong>${money(costValue)}</strong><span>${t("currentMonth")}</span></article></div>
      <div class="notice" style="margin-bottom:15px">${t("net")}: <strong>${money(milkValue - costValue)}</strong>. This is a simple milk-value comparison, not a tax or accounting statement.</div>
      <article class="panel" style="margin-bottom:15px"><div class="panel-head"><div><h2 class="panel-title">Farm snapshot</h2><div class="panel-hint">Current herd and operations</div></div></div><div class="panel-body"><div class="grid kpi-grid" style="margin:0"><div><span class="stat-label">Healthy animals</span><div class="money">${db.cows.filter((cow) => cow.health === "Healthy").length} / ${db.cows.length}</div></div><div><span class="stat-label">Active buyers</span><div class="money">${db.buyers.filter((buyer) => buyer.active !== false).length}</div></div><div><span class="stat-label">Active team members</span><div class="money">${db.workers.filter((worker) => worker.active !== false).length}</div></div></div></div></article>
      ${tablePanel(["Date", "Milk entries", "Collection", "Milk value"], rows, "▤", "Milk-by-day detail will appear here as you log collection.")}`;
  }

  function renderSettings() {
    return `${pageHeader(t("settings"), "Your device-local farm profile, milk rate and data controls.")}
      <div class="grid settings-grid">
        <article class="panel"><div class="panel-head"><div><h2 class="panel-title">Farm profile</h2><div class="panel-hint">Only used to label this device’s ledger.</div></div></div><div class="panel-body">
          <form class="profile-form" data-form="profile">
            <label class="form-group"><span class="form-label">${t("farmName")}</span><input class="field" name="name" value="${esc(db.farm.name)}" required maxlength="70"></label>
            <label class="form-group"><span class="form-label">${t("owner")}</span><input class="field" name="owner" value="${esc(db.farm.owner || "")}" maxlength="70"></label>
            <label class="form-group"><span class="form-label">${t("phone")}</span><input class="field" name="phone" value="${esc(db.farm.phone || "")}" type="tel" maxlength="25"></label>
            <label class="form-group"><span class="form-label">${t("location")}</span><input class="field" name="location" value="${esc(db.farm.location || "")}" maxlength="100"></label>
            <label class="form-group"><span class="form-label">${t("language")}</span><select class="field" name="language"><option value="en" ${db.language === "en" ? "selected" : ""}>English</option><option value="hi" ${db.language === "hi" ? "selected" : ""}>हिन्दी</option></select></label>
            <label class="form-group"><span class="form-label">${t("perLitre")}</span><input class="field" name="rate" type="number" min="0" step="0.01" value="${esc(db.rate)}" required></label>
            <div class="full"><button class="button primary" type="submit">${t("save")}</button></div>
          </form>
        </div></article>
        <article class="panel"><div class="panel-head"><div><h2 class="panel-title">Your data, your device</h2><div class="panel-hint">No account, cloud or external database is connected.</div></div></div><div class="panel-body">
          <div class="notice">${t("localWarning")}</div>
          <div class="toolbar" style="margin-top:16px"><button class="button soft" data-action="backup">${t("backup")} · JSON</button><button class="button soft" data-action="csv">${t("export")}</button><button class="button soft" data-action="restore">${t("restore")}</button><input id="restore-file" class="hide" type="file" accept="application/json"></div>
          <div class="summary-row"><span>Animals</span><strong>${db.cows.length}</strong></div><div class="summary-row"><span>Milk records</span><strong>${db.milk.length}</strong></div><div class="summary-row"><span>Farm costs</span><strong>${db.expenses.length}</strong></div><div class="summary-row"><span>Cashbook entries</span><strong>${db.payments.length}</strong></div>
        </div></article>
      </div>`;
  }

  function labelFor(options, key) {
    return options.find(([value]) => value === key)?.[1] || key || "—";
  }

  function field(label, name, value = "", options = {}) {
    const { type = "text", required = false, step, min, placeholder = "", choices, full = false, readonly = false, maxlength } = options;
    const cls = `form-group${full ? " full" : ""}`;
    let control;
    if (choices) {
      control = `<select class="field" name="${esc(name)}" ${required ? "required" : ""}>${choices.map(([key, text]) => `<option value="${esc(key)}" ${String(value) === String(key) ? "selected" : ""}>${esc(text)}</option>`).join("")}</select>`;
    } else if (type === "textarea") {
      control = `<textarea class="textarea" name="${esc(name)}" ${maxlength ? `maxlength="${maxlength}"` : ""} placeholder="${esc(placeholder)}">${esc(value)}</textarea>`;
    } else {
      control = `<input class="field" name="${esc(name)}" type="${type}" value="${esc(value)}" ${required ? "required" : ""} ${step ? `step="${step}"` : ""} ${min !== undefined ? `min="${min}"` : ""} ${maxlength ? `maxlength="${maxlength}"` : ""} ${readonly ? "readonly" : ""} placeholder="${esc(placeholder)}">`;
    }
    return `<label class="${cls}"><span class="form-label">${esc(label)}${required ? " *" : ""}</span>${control}</label>`;
  }

  function renderModal() {
    const old = modal.id ? db[modal.type]?.find((row) => row.id === modal.id) : null;
    const edit = Boolean(old);
    const forms = {
      cow: [
        field("Animal name", "name", old?.name, { required: true, maxlength: 60 }),
        field("Tag number", "tag", old?.tag, { required: true, maxlength: 24 }),
        field("Breed", "breed", old?.breed || BREEDS[0], { choices: BREEDS.map((breed) => [breed, breed]) }),
        field("Color / markings", "color", old?.color, { maxlength: 60 }),
        field("Health", "health", old?.health || "Healthy", { choices: ["Healthy", "Sick", "Pregnant"].map((item) => [item, item]) }),
        field("Lactation stage", "stage", old?.stage || "Early", { choices: ["Dry", "Early", "Peak", "Late"].map((item) => [item, item]) }),
        field("Milk yield", "yield", old?.yield, { placeholder: "e.g. 8–10 L/day" }),
        field("Production level", "production", old?.production || "Good", { choices: ["Good", "Average", "Low", "Dry"].map((item) => [item, item]) }),
        field("Date of birth", "dob", old?.dob, { type: "date" }),
        field("Last health check", "checkup", old?.checkup || today(), { type: "date" }),
        field("Breeding date", "breedingDate", old?.breedingDate, { type: "date" }),
        field("Expected calving", "deliveryDate", old?.deliveryDate, { type: "date" }),
        field("Notes", "notes", old?.notes, { type: "textarea", full: true })
      ],
      milk: [
        field("Animal", "cowId", old?.cowId || "all", { choices: [["all", "Whole herd"], ...db.cows.map((cow) => [cow.id, `${cow.name} · ${cow.tag}`])] }),
        field("Date", "date", old?.date || today(), { type: "date", required: true }),
        field("Session", "session", old?.session || "Morning", { choices: ["Morning", "Evening"].map((item) => [item, item]) }),
        field("Litres collected", "litres", old?.litres, { type: "number", step: "0.1", min: "0.1", required: true }),
        field("Fat %", "fat", old?.fat, { type: "number", step: "0.1", min: "0" }),
        field("SNF %", "snf", old?.snf, { type: "number", step: "0.1", min: "0" }),
        field(`Rate per litre (${money(db.rate)})`, "rate", old?.rate ?? db.rate, { type: "number", step: "0.01", min: "0", required: true }),
        field("Notes", "notes", old?.notes, { type: "textarea", full: true })
      ],
      expense: [
        field("Date", "date", old?.date || today(), { type: "date", required: true }),
        field("Category", "category", old?.category || "feed", { choices: COST_TYPES }),
        field("Description", "description", old?.description, { required: true, maxlength: 100 }),
        field("Amount (₹)", "amount", old?.amount, { type: "number", step: "0.01", min: "0.01", required: true }),
        field("Paid to / vendor", "vendor", old?.vendor, { maxlength: 70 }),
        field("Notes", "notes", old?.notes, { type: "textarea", full: true })
      ],
      worker: [
        field("Name", "name", old?.name, { required: true, maxlength: 70 }),
        field("Phone", "phone", old?.phone, { type: "tel", maxlength: 25 }),
        field("Role", "role", old?.role, { maxlength: 60 }),
        field("Daily wage (₹)", "dailyWage", old?.dailyWage, { type: "number", step: "0.01", min: "0" }),
        field("Hourly wage (₹)", "hourlyWage", old?.hourlyWage, { type: "number", step: "0.01", min: "0" }),
        field("Status", "active", String(old?.active !== false), { choices: [["true", "Active"], ["false", "Inactive"]] })
      ],
      buyer: [
        field("Contact name", "name", old?.name, { required: true, maxlength: 70 }),
        field("Company", "company", old?.company, { maxlength: 70 }),
        field("Phone", "phone", old?.phone, { type: "tel", maxlength: 25 }),
        field("Email", "email", old?.email, { type: "email", maxlength: 100 }),
        field("Rate per litre (₹)", "rate", old?.rate, { type: "number", step: "0.01", min: "0", required: true }),
        field("Contract", "contract", old?.contract || "Fixed", { choices: [["Fixed", "Fixed rate"], ["Sliding", "Sliding rate"]] }),
        field("Start date", "startDate", old?.startDate || today(), { type: "date" }),
        field("End date", "endDate", old?.endDate, { type: "date" }),
        field("Payment terms / notes", "terms", old?.terms, { type: "textarea", full: true }),
        field("Status", "active", String(old?.active !== false), { choices: [["true", "Active"], ["false", "Inactive"]], full: true })
      ],
      payment: [
        field("Type", "type", old?.type || "income", { choices: [["income", "Income received"], ["expense", "Expense paid"]] }),
        field("Date", "date", old?.date || today(), { type: "date", required: true }),
        field("To / from", "party", old?.party, { required: true, maxlength: 80 }),
        field("Amount (₹)", "amount", old?.amount, { type: "number", step: "0.01", min: "0.01", required: true }),
        field("Payment mode", "mode", old?.mode || "Cash", { choices: ["Cash", "UPI", "Bank transfer", "Cheque", "Other"].map((item) => [item, item]) }),
        field("Invoice / reference", "invoice", old?.invoice, { maxlength: 50 }),
        field("Notes", "notes", old?.notes, { type: "textarea", full: true })
      ],
      rate: [field("Milk rate per litre (₹)", "rate", db.rate, { type: "number", step: "0.01", min: "0", required: true, full: true })]
    };
    const titles = { cow: edit ? "Edit animal" : "Add animal", milk: edit ? "Edit milk record" : "Log milk collection", expense: edit ? "Edit farm cost" : "Record farm cost", worker: edit ? "Edit team member" : "Add team member", buyer: edit ? "Edit buyer" : "Add buyer", payment: edit ? "Edit cashbook entry" : "Add cashbook entry", rate: "Update milk rate" };
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <header class="modal-head"><h2 class="modal-title" id="modal-title">${titles[modal.type]}</h2><button class="icon-button" type="button" data-action="close-modal" aria-label="Close">×</button></header>
      <form data-form="${modal.type}" data-id="${esc(modal.id || "")}"><div class="modal-body">${(forms[modal.type] || []).join("")}</div>
        <div class="modal-actions"><button class="button soft" type="button" data-action="close-modal">${t("cancel")}</button><button class="button primary" type="submit">${edit ? t("save") : t("save")}</button></div>
      </form></section></div>`;
  }

  function openModal(type, recordId = "") {
    modal = { type, id: recordId };
    render();
    document.querySelector(".modal input, .modal select")?.focus();
  }

  function closeModal() {
    modal = null;
    render();
  }

  function addOrUpdate(type, data, recordId = "") {
    const collectionKey = ({ cow: "cows", milk: "milk", expense: "expenses", worker: "workers", buyer: "buyers", payment: "payments" })[type];
    const collection = type === "rate" ? null : db[collectionKey];
    if (type !== "rate" && !Array.isArray(collection)) throw new Error("Unknown farm record.");
    if (type === "cow") {
      const duplicate = db.cows.some((cow) => cow.tag?.toLowerCase() === data.tag.toLowerCase() && cow.id !== recordId);
      if (duplicate) return showToast("That animal tag is already in use.", true);
    }
    if (type === "milk") {
      const duplicate = db.milk.some((entry) => entry.date === data.date && entry.session === data.session && entry.cowId === data.cowId && entry.id !== recordId);
      if (duplicate) return showToast("A record for this animal and session already exists on that date.", true);
      data.litres = Number(data.litres);
      data.rate = Number(data.rate);
      data.total = data.litres * data.rate;
      data.fat = Number(data.fat) || 0;
      data.snf = Number(data.snf) || 0;
    }
    if (type === "expense" || type === "payment") data.amount = Number(data.amount);
    if (type === "worker") {
      data.dailyWage = Number(data.dailyWage) || 0;
      data.hourlyWage = Number(data.hourlyWage) || 0;
      data.active = data.active !== "false";
    }
    if (type === "buyer") {
      data.rate = Number(data.rate);
      data.active = data.active !== "false";
    }
    if (type === "cow" && data.health !== "Pregnant") {
      data.breedingDate = "";
      data.deliveryDate = "";
    }
    if (type === "rate") {
      db.rate = Number(data.rate);
    } else if (recordId) {
      const index = collection.findIndex((row) => row.id === recordId);
      if (index < 0) return showToast("This record no longer exists.", true);
      collection[index] = { ...collection[index], ...data };
    } else {
      collection.push({ ...data, id: id(), createdAt: new Date().toISOString() });
    }
    persist();
    modal = null;
    search = "";
    render();
    showToast("Farm ledger updated.");
  }

  function removeRecord(type, recordId) {
    if (!LISTS.includes(type)) return;
    if (!confirm("Remove this record from this device?")) return;
    db[type] = db[type].filter((row) => row.id !== recordId);
    persist();
    render();
    showToast("Record removed.");
  }

  function saveForm(form) {
    const formType = form.dataset.form;
    const values = Object.fromEntries(new FormData(form).entries());
    if (formType === "setup") {
      db.farm = { name: values.name.trim(), owner: values.owner.trim(), phone: values.phone.trim(), location: values.location.trim() };
      db.language = values.language === "hi" ? "hi" : "en";
      if (persist()) { render(); showToast("Your local farm ledger is ready."); }
      return;
    }
    if (formType === "profile") {
      db.farm = { ...db.farm, name: values.name.trim(), owner: values.owner.trim(), phone: values.phone.trim(), location: values.location.trim() };
      db.language = values.language === "hi" ? "hi" : "en";
      values.rate = Number(values.rate);
      if (!Number.isFinite(values.rate) || values.rate < 0) return showToast("Enter a valid milk rate.", true);
      db.rate = values.rate;
      if (persist()) { render(); showToast("Farm settings saved."); }
      return;
    }
    const type = formType;
    if (type === "rate") {
      addOrUpdate("rate", values);
      return;
    }
    if (type === "cow" && values.breedingDate && !values.deliveryDate) {
      const due = new Date(`${values.breedingDate}T00:00:00`);
      due.setDate(due.getDate() + 283);
      values.deliveryDate = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
    }
    const editId = form.dataset.id || "";
    addOrUpdate(type, values, editId);
  }

  function shareSummary() {
    const todayMilk = sum(db.milk.filter((entry) => entry.date === today()), "litres");
    const month = today().slice(0, 7);
    const msg = `${db.farm.name} — Dairy Milk daily summary\n${fmtDate(today())}\nAnimals: ${db.cows.length}\nMilk today: ${todayMilk.toFixed(1)} L\nMilk records this month: ${db.milk.filter((entry) => entry.date?.startsWith(month)).length}\nFarm costs this month: ${money(sum(db.expenses.filter((entry) => entry.date?.startsWith(month)), "amount"))}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportBackup() {
    download(`milkledger-backup-${today()}.json`, JSON.stringify(db, null, 2), "application/json");
  }

  function exportCsv() {
    const headers = ["record_type", "date", "name_or_description", "category_or_session", "quantity_litres", "rate_inr", "amount_inr", "notes"];
    const rows = [];
    for (const cow of db.cows) rows.push(["Animal", "", cow.name, cow.breed, "", "", "", cow.notes]);
    for (const entry of db.milk) rows.push(["Milk", entry.date, animalName(entry.cowId), entry.session, entry.litres, entry.rate, entry.total, entry.notes]);
    for (const entry of db.expenses) rows.push(["Farm cost", entry.date, entry.description, labelFor(COST_TYPES, entry.category), "", "", entry.amount, entry.notes]);
    for (const worker of db.workers) rows.push(["Team member", "", worker.name, worker.role, "", worker.dailyWage, worker.hourlyWage, worker.phone]);
    for (const buyer of db.buyers) rows.push(["Buyer", "", buyer.name, buyer.company, "", buyer.rate, "", buyer.email || buyer.phone]);
    for (const entry of db.payments) rows.push(["Cashbook", entry.date, entry.party, entry.type, "", "", entry.amount, entry.notes]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    download(`milkledger-records-${today()}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
  }

  function restoreBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !parsed.farm || !LISTS.every((key) => Array.isArray(parsed[key]))) throw new Error("This file is not a MilkLedger backup.");
        if (!confirm("Restore this backup? It will replace the farm data currently saved in this browser.")) return;
        const next = freshDb();
        next.farm = parsed.farm;
        next.language = parsed.language === "hi" ? "hi" : "en";
        next.rate = Number(parsed.rate) || 35;
        for (const key of LISTS) next[key] = parsed[key];
        db = next;
        persist();
        route = "dashboard";
        render();
        showToast("Backup restored to this browser.");
      } catch (error) {
        showToast(error.message || "Could not read that backup.", true);
      }
    };
    reader.onerror = () => showToast("Could not read the selected backup file.", true);
    reader.readAsText(file);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "close-modal") {
      if (event.target === button || button.closest("button")) closeModal();
      return;
    }
    if (action === "route") {
      route = button.dataset.value;
      search = "";
      document.getElementById("rail")?.classList.remove("open");
      render();
    } else if (action === "menu") {
      document.getElementById("rail")?.classList.toggle("open");
    } else if (action === "language") {
      db.language = db.language === "en" ? "hi" : "en";
      persist();
      render();
    } else if (action === "new") {
      openModal(button.dataset.value);
    } else if (action === "edit") {
      openModal(button.dataset.type, button.dataset.id);
    } else if (action === "delete") {
      removeRecord(button.dataset.type, button.dataset.id);
    } else if (action === "csv") {
      exportCsv();
    } else if (action === "print") {
      window.print();
    } else if (action === "share") {
      shareSummary();
    } else if (action === "backup") {
      exportBackup();
    } else if (action === "restore") {
      document.getElementById("restore-file")?.click();
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    saveForm(form);
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "record-search") {
      const position = event.target.selectionStart;
      search = event.target.value;
      render();
      const next = document.getElementById("record-search");
      next?.focus();
      next?.setSelectionRange(position, position);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "restore-file" && event.target.files?.[0]) restoreBackup(event.target.files[0]);
    if (event.target.name === "breedingDate" && event.target.value) {
      const due = new Date(`${event.target.value}T00:00:00`);
      due.setDate(due.getDate() + 283);
      const delivery = document.querySelector('[name="deliveryDate"]');
      if (delivery && !delivery.value) delivery.value = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
    }
  });

  try {
    db = loadDb();
    render();
  } catch (error) {
    console.error("Could not load the local farm ledger.", error);
    app.innerHTML = `<main class="onboard"><section class="onboard-card"><header class="onboard-banner"><span class="brand-mark">M</span><div><h1>MilkLedger</h1><p>Dairy Milk</p></div></header><div class="onboard-content"><h1>Could not open this ledger</h1><p>The saved data in this browser could not be read. It has not been overwritten.</p><div class="privacy-note">${esc(error.message)}</div><button class="button soft" type="button" data-action="backup" style="margin-top:15px">Close</button></div></section></main>`;
  }
})();
