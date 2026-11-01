/* Matthew's service-request prototype. Later replace load/save with fetch to Node.js.
   MySQL will hold requests; MongoDB will hold notes linked by request ID. */
document.addEventListener("DOMContentLoaded", () => {
  const equipment = [
    { id: "CAM-001", name: "Main Entrance Camera", site: "Demo North" },
    { id: "CAM-002", name: "Loading Dock Camera", site: "Demo North" },
    { id: "ACS-001", name: "Office Card Reader", site: "Demo South" },
    { id: "IDS-001", name: "Warehouse Motion Detector", site: "Demo South" }
  ];
  const key = "csc441-service-requests-v1";
  const statuses = ["Open", "In Progress", "Closed"];
  const priorities = ["Low", "Normal", "High"];
  const equipmentLabel = id => {
    const item = equipment.find(item => item.id === id);
    return item ? `${item.id} — ${item.name} (${item.site})` : id;
  };
  function load() {
    const records = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(records) || !records.every(r => r && typeof r.id === "string" &&
      typeof r.equipmentId === "string" && typeof r.requester === "string" &&
      typeof r.issue === "string" && priorities.includes(r.priority) && statuses.includes(r.status) &&
      typeof r.createdAt === "string" && Array.isArray(r.notes) && r.notes.every(n =>
        n && typeof n.author === "string" && typeof n.text === "string" && typeof n.createdAt === "string"))) {
      throw new Error("Invalid saved records");
    }
    return records;
  }
  function save(records) { localStorage.setItem(key, JSON.stringify(records)); }
  // Use textContent for user-entered text, avoiding HTML interpretation.
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  const form = document.getElementById("serviceForm");
  if (form) {
    const select = document.getElementById("equipmentId");
    equipment.forEach(item => select.add(new Option(equipmentLabel(item.id), item.id)));
    const issue = document.getElementById("issue");
    const counter = document.getElementById("issueCount");
    issue.addEventListener("input", () => { counter.textContent = `${issue.value.length} / 500 characters`; });
    form.addEventListener("submit", event => {
      event.preventDefault();
      const feedback = document.getElementById("submitStatus");
      const requester = form.elements.requester.value.trim();
      const description = issue.value.trim();
      if (requester.length < 2 || description.length < 10 || description.length > 500 ||
          !equipment.some(item => item.id === select.value) || !priorities.includes(form.elements.priority.value)) {
        feedback.textContent = "Choose equipment and priority, enter a name of at least 2 characters, and describe the issue in 10–500 characters.";
        feedback.className = "error"; return;
      }
      try {
        const records = load();
        const id = "SR-" + crypto.randomUUID();
        records.unshift({ id, equipmentId: select.value, requester, priority: form.elements.priority.value,
          issue: description, status: "Open", createdAt: new Date().toISOString(), notes: [] });
        save(records);
        feedback.textContent = `Demo request ${id} saved in this browser. View it on Service Requests.`;
        feedback.className = "success"; form.reset(); counter.textContent = "0 / 500 characters";
      } catch (error) {
        feedback.textContent = "Request could not be saved. Browser storage may be blocked, full, or contain invalid data. Your entries have been kept.";
        feedback.className = "error";
      }
    });
  }
  const list = document.getElementById("requestList");
  if (!list) return;
  const search = document.getElementById("requestSearch");
  const filter = document.getElementById("statusFilter");
  const feedback = document.getElementById("requestFeedback");
  function update(id, change) {
    try {
      const records = load();
      const record = records.find(r => r.id === id);
      if (!record) throw new Error("Request missing");
      change(record); save(records);
      feedback.textContent = "Demo change saved in this browser."; feedback.className = "success";
      render(); return true;
    } catch (error) {
      feedback.textContent = "Change could not be saved. Check browser storage and reload the page.";
      feedback.className = "error"; return false;
    }
  }
  function render() {
    list.replaceChildren();
    let records;
    try { records = load(); }
    catch (error) { feedback.textContent = "Saved requests could not be read. Browser storage may be blocked or contain invalid data."; feedback.className = "error"; document.getElementById("requestCount").textContent = ""; return; }
    const query = search.value.trim().toLowerCase();
    const visible = records.filter(r => (!filter.value || r.status === filter.value) &&
      [r.id, equipmentLabel(r.equipmentId), r.requester, r.issue].join(" ").toLowerCase().includes(query));
    document.getElementById("requestCount").textContent = `${visible.length} of ${records.length} requests shown.`;
    if (!visible.length) list.append(element("p", records.length ? "No requests match your filters." : "No service requests yet. Submit a request to begin."));
    visible.forEach(record => {
      const card = element("article", undefined, "card");
      card.append(element("h2", record.id), element("p", equipmentLabel(record.equipmentId)),
        element("p", `Requester: ${record.requester} | Priority: ${record.priority}`),
        element("p", `Submitted: ${new Date(record.createdAt).toLocaleString()}`), element("p", record.issue));
      const statusId = "status-" + record.id;
      const label = element("label", "Request status"); label.htmlFor = statusId;
      const status = element("select"); status.id = statusId;
      statuses.forEach(value => status.add(new Option(value, value, false, value === record.status)));
      status.addEventListener("change", () => { if (!update(record.id, r => { r.status = status.value; })) status.value = record.status; });
      card.append(label, status, element("h3", "Service notes"));
      const notes = element("ul", undefined, "review-list");
      record.notes.forEach(note => notes.append(element("li", `${note.author} — ${new Date(note.createdAt).toLocaleString()}: ${note.text}`)));
      card.append(record.notes.length ? notes : element("p", "No service notes yet."));
      const noteForm = element("form", undefined, "form");
      const author = element("input"); author.id = "author-" + record.id; author.required = true; author.minLength = 2; author.maxLength = 100;
      const authorLabel = element("label", "Note author"); authorLabel.htmlFor = author.id;
      const text = element("textarea"); text.id = "note-" + record.id; text.required = true; text.maxLength = 1000; text.rows = 3;
      const textLabel = element("label", "Service note"); textLabel.htmlFor = text.id;
      const authorField = element("div", undefined, "field"); authorField.append(authorLabel, author);
      const textField = element("div", undefined, "field"); textField.append(textLabel, text);
      const button = element("button", "Add demo note", "btn"); button.type = "submit";
      const noteError = element("p"); noteError.setAttribute("role", "status");
      noteForm.append(authorField, textField, button, noteError);
      noteForm.addEventListener("submit", event => {
        event.preventDefault();
        if (author.value.trim().length < 2 || !text.value.trim()) { noteError.textContent = "Enter an author of at least 2 characters and a nonblank note."; return; }
        update(record.id, r => r.notes.push({ author: author.value.trim(), text: text.value.trim(), createdAt: new Date().toISOString() }));
      });
      card.append(noteForm); list.append(card);
    });
  }
  search.addEventListener("input", render); filter.addEventListener("change", render); render();
});
