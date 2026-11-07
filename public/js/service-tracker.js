document.addEventListener("DOMContentLoaded", () => {
  const account = document.getElementById("accountStatus");
  const form = document.getElementById("serviceForm");
  const login = document.getElementById("loginForm");
  const list = document.getElementById("requestList");
  const grid = document.getElementById("equipmentGrid");
  const statuses = ["Open", "In Progress", "Closed"];
  const make = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const show = (node, text, failed = false) => {
    node.textContent = text;
    node.className = failed ? "error" : "";
  };
  // Form validation: each rule returns an error message or "". JavaScript adds the
  // message under the field and toggles the .invalid/.valid classes (DOM modification).
  function validate(formEl, rules) {
    let firstBad;
    for (const [name, rule] of Object.entries(rules)) {
      const field = formEl.elements[name];
      let msg = field.parentElement.querySelector(".error-msg");
      if (!msg) {
        msg = make("small", "", "error-msg");
        msg.id = field.id + "Error";
        field.parentElement.append(msg);
        field.setAttribute("aria-describedby", [field.getAttribute("aria-describedby"), msg.id].filter(Boolean).join(" "));
      }
      const error = rule(field.value.trim());
      msg.textContent = error;
      field.classList.toggle("invalid", Boolean(error));
      field.classList.toggle("valid", !error);
      field.setAttribute("aria-invalid", Boolean(error));
      if (error && !firstBad) firstBad = field;
    }
    firstBad?.focus();
    return !firstBad;
  }
  const loginRules = {
    username: v => !v ? "Enter your username." : /^[a-z0-9._-]{3,60}$/i.test(v) ? "" : "Usernames use 3–60 letters, numbers, dots, dashes, or underscores.",
    password: v => v ? "" : "Enter your password."
  };
  const requestRules = {
    equipmentId: v => v ? "" : "Choose the equipment that needs service.",
    priority: v => v ? "" : "Choose a priority.",
    issue: v => v.length < 10 ? `Describe the issue in at least 10 characters (${v.length} so far).` : v.length > 500 ? "Keep the description under 500 characters." : ""
  };

  async function api(url, method = "GET", body) {
    const res = await fetch(url, { method, ...(body === undefined ? {} : {
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    }) });
    if (!res.headers.get("content-type")?.includes("application/json"))
      throw new Error("Open this page through the Node.js server.");
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 && !login) {
        account.replaceChildren(make("a", "Sign in to continue"));
        account.firstChild.href = "/login";
        if (form) form.querySelector("button").disabled = true;
        if (list) list.replaceChildren();
        if (grid) grid.replaceChildren();
      }
      throw Object.assign(new Error(data.error), { status: res.status });
    }
    return data;
  }
  async function start() {
    let user;
    try { user = await api("/api/session"); }
    catch (error) {
      if (error.status !== 401) throw error;
      if (!login) return;
    }
    if (login) {
      const logout = document.getElementById("logout");
      login.hidden = Boolean(user);
      logout.hidden = !user;
      show(account, user ? `Signed in as ${user.name}.` : "");
      if (user) {
        const link = make("a", "Submit a service request");
        link.href = "/submit";
        account.append(" ", link);
      }
      logout.addEventListener("click", async () => {
        try { await api("/api/logout", "POST", {}); location.reload(); }
        catch (error) { show(account, error.message, true); }
      });
      login.addEventListener("submit", async event => {
        event.preventDefault();
        if (!validate(login, loginRules)) return;
        const button = login.querySelector("button");
        button.disabled = true;
        try {
          await api("/api/login", "POST", Object.fromEntries(new FormData(login)));
          location.href = "/submit";
        } catch (error) { show(account, error.message, true); button.disabled = false; }
      });
      return;
    }
    show(account, `Signed in as ${user.name}.`);
    if (form) {
      const equipment = await api("/api/equipment");
      const select = form.elements.equipmentId;
      for (const item of equipment) select.add(new Option(`${item.site} — ${item.name} (${item.id})`, item.id));
      const selected = new URLSearchParams(location.search).get("equipment");
      if (equipment.some(item => item.id === selected)) select.value = selected;
      const submit = form.querySelector("button");
      submit.disabled = !equipment.length;
      const issue = form.elements.issue;
      const counter = document.getElementById("issueCount");
      const updateCount = () => {
        counter.textContent = `${issue.value.length} / 500 characters`;
        counter.classList.toggle("error", issue.value.length > 450);
      };
      issue.addEventListener("input", updateCount);
      const feedback = document.getElementById("submitStatus");
      if (!equipment.length) show(feedback, "No equipment is available for your assigned locations.");
      form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!validate(form, requestRules)) return;
        submit.disabled = true;
        let signedOut = false;
        try {
          const record = await api("/api/requests", "POST", Object.fromEntries(new FormData(form)));
          show(feedback, `Service request SR-${record.id} submitted.`);
          form.reset(); updateCount();
          form.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
        } catch (error) { signedOut = error.status === 401; show(feedback, error.message, true); }
        finally { submit.disabled = signedOut; }
      });
    }
    if (grid) {
      const equipment = await api("/api/equipment");
      const search = document.getElementById("equipmentSearch");
      search.disabled = false;
      const render = () => {
        const query = search.value.trim().toLowerCase();
        const matching = equipment.filter(item => [item.id, item.name, item.site].join(" ").toLowerCase().includes(query));
        grid.replaceChildren();
        for (const item of matching) {
          const card = make("article", undefined, "card");
          const link = make("a", "Request service");
          link.href = "/submit?equipment=" + encodeURIComponent(item.id);
          card.append(make("h2", item.name), make("p", item.id), make("p", item.site), link);
          grid.append(card);
        }
        document.getElementById("noResults").classList.toggle("hidden", matching.length > 0);
      };
      search.addEventListener("input", render);
      render();
    }
    if (list) await setupList();
  }
  async function setupList() {
    const records = await api("/api/requests");
    const search = document.getElementById("requestSearch");
    const filter = document.getElementById("statusFilter");
    function render() {
      list.replaceChildren();
      const query = search.value.trim().toLowerCase();
      const visible = records.filter(r => (!filter.value || filter.value === r.status) &&
        [`SR-${r.id}`, r.equipmentId, r.equipmentName, r.site, r.requester, r.issue].join(" ").toLowerCase().includes(query));
      document.getElementById("requestCount").textContent = `${visible.length} of ${records.length} requests shown.`;
      if (!visible.length) list.append(make("p", records.length ? "No requests match your filters." : "No service requests yet."));
      for (const record of visible) {
        const card = make("article", undefined, "card");
        const route = `/api/requests/${record.id}`;
        const info = make("p", "", "hint");
        info.setAttribute("role", "status");
        const status = make("select");
        status.id = `status-${record.id}`;
        const label = make("label", "Request status");
        label.htmlFor = status.id;
        for (const value of statuses) status.add(new Option(value, value, false, value === record.status));
        status.addEventListener("change", async () => {
          status.disabled = true;
          try {
            const saved = await api(route, "PATCH", { status: status.value });
            record.status = saved.status;
            if (filter.value && filter.value !== record.status) render();
            show(document.getElementById("requestFeedback"), "Status updated.");
          } catch (error) { status.value = record.status; show(info, error.message, true); }
          finally { status.disabled = false; }
        });
        const details = make("details");
        const notes = make("ul", undefined, "review-list");
        const noteForm = make("form", undefined, "form");
        const input = make("textarea");
        input.id = `note-${record.id}`;
        input.required = true;
        input.maxLength = 1000;
        const noteLabel = make("label", "Service note"); noteLabel.htmlFor = input.id;
        const button = make("button", "Add note", "btn"); button.type = "submit";
        const noteField = make("div", undefined, "field"); noteField.append(noteLabel, input);
        noteForm.append(noteField, button);
        const add = note => notes.append(make("li", `${note.author} — ${new Date(note.createdAt).toLocaleString()}: ${note.text}`));
        let loaded = false;
        let loading = false;
        button.disabled = true;
        details.addEventListener("toggle", async () => {
          if (!details.open || loaded || loading) return;
          loading = true;
          button.disabled = true;
          try {
            const rows = await api(route + "/notes");
            notes.replaceChildren(); rows.forEach(add); loaded = true;
            show(info, rows.length ? "" : "No service notes yet.");
          } catch (error) { show(info, error.message, true); }
          finally { loading = false; button.disabled = false; }
        });
        noteForm.addEventListener("submit", async event => {
          event.preventDefault(); button.disabled = true;
          try {
            if (!input.value.trim()) { show(info, "Enter a note before saving.", true); input.focus(); return; }
          const note = await api(route + "/notes", "POST", { text: input.value });
            add(note);
            input.value = ""; show(info, "Service note saved.");
          } catch (error) { show(info, error.message, true); }
          finally { button.disabled = false; }
        });
        details.append(make("summary", "Service notes"), notes, noteForm);
        card.append(make("h2", `SR-${record.id}`), make("p", `${record.site} — ${record.equipmentName} (${record.equipmentId})`),
          make("p", `Requester: ${record.requester} | Priority: ${record.priority}`),
          make("p", `Submitted: ${new Date(record.createdAt).toLocaleString()}`), make("p", record.issue),
          label, status, details, info);
        list.append(card);
      }
    }
    search.addEventListener("input", render);
    filter.addEventListener("change", render);
    render();
  }
  start().catch(error => show(account, error.message, true));
});
