// Server-side HTML helpers. Pages built here use the same header, nav, and footer as public/*.html.
const nav = [["/", "Home"], ["/about", "About"], ["/equipment", "Equipment"], ["/requests", "Service Requests"],
  ["/submit", "Submit Request"], ["/summary", "Summary"], ["/login", "Sign In"]];

// Escape every database value before it goes into HTML.
const escape = value => String(value ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function layout(title, active, body) {
  const links = nav.map(([href, label]) => href === active
    ? `<li><a href="${href}" class="active" aria-current="page">${label}</a></li>`
    : `<li><a href="${href}">${label}</a></li>`).join("\n        ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(title)} | Security Equipment &amp; Service Tracker</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo">Security Equipment &amp; Service Tracker</a>
      <button id="menuBtn" class="menu-btn" aria-expanded="false" aria-controls="mainNav">Menu</button>
      <nav id="mainNav" class="main-nav" aria-label="Main">
        <ul>
        ${links}
      </ul>
      </nav>
      <button id="themeBtn" class="theme-btn" type="button">Dark mode</button>
    </div>
  </header>
  <main class="container">
${body}
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>&copy; <span id="year"></span> Security Equipment &amp; Service Tracker &middot; CSC441 Team Project</p>
    </div>
  </footer>
  <script src="/js/main.js"></script>
</body>
</html>`;
}

// Summary page: MySQL request counts and equipment list plus recent MongoDB service notes.
function summaryPage(user, sites, equipment, notes) {
  const siteRows = sites.map(s => `<tr><td>${escape(s.site)}</td><td>${s.equipment}</td><td>${s.open}</td><td>${s.inProgress}</td><td>${s.closed}</td></tr>`).join("\n");
  const equipmentRows = equipment.map(e => `<tr><td>${escape(e.id)}</td><td>${escape(e.name)}</td><td>${escape(e.site)}</td><td>${e.activeRequests}</td>
        <td><a href="/submit?equipment=${encodeURIComponent(e.id)}">Request service</a></td></tr>`).join("\n");
  const noteItems = notes.length
    ? notes.map(n => `<li><strong>SR-${n.requestId}</strong> &middot; ${escape(n.author)} &middot; <time datetime="${new Date(n.createdAt).toISOString()}">${escape(new Date(n.createdAt).toLocaleString("en-US"))}</time><br>${escape(n.text)}</li>`).join("\n")
    : "<li>No service notes yet.</li>";
  return layout("Summary", "/summary", `    <section>
      <h1>Site Summary</h1>
      <p>Signed in as ${escape(user.name)}. This page is built on the server from MySQL and MongoDB query results.</p>
      <h2>Requests by Location</h2>
      <div class="table-wrap"><table class="team-table">
        <thead><tr><th>Location</th><th>Equipment</th><th>Open</th><th>In Progress</th><th>Closed</th></tr></thead>
        <tbody>
${siteRows || '<tr><td colspan="5">No assigned locations.</td></tr>'}
        </tbody>
      </table></div>
    </section>
    <section>
      <h2>Equipment</h2>
      <div class="table-wrap"><table class="team-table">
        <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Active requests</th><th>Action</th></tr></thead>
        <tbody>
${equipmentRows || '<tr><td colspan="5">No equipment.</td></tr>'}
        </tbody>
      </table></div>
    </section>
    <section>
      <h2>Recent Service Notes</h2>
      <ul class="review-list">
${noteItems}
      </ul>
    </section>`);
}

module.exports = { layout, summaryPage, escape };
