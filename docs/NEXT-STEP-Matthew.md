# Service request prototype — Matthew's next contribution

## Completed in this review copy
- Adopted Security Equipment & Service Tracker branding and navigation labels.
- Converted contact.html to Submit Service Request.
- Converted reviews.html to Service Requests, including status updates and service notes.
- Added public/js/service-tracker.js separately to avoid rewriting the shared JavaScript.
- Preserved John's CSS and existing filenames. Home, About, and Equipment body content still needs his adaptation.
- Added four fictional devices for the request selector. These are temporary and must ultimately come from the same MySQL equipment source as the inventory.

## Run and check
Open the project folder in VS Code. Use Live Server on public/contact.html.
Use the same browser, host, and port when opening public/reviews.html.
1. Submit an incomplete form: required fields should prevent saving.
2. Enter whitespace-only values: the script should reject them.
3. Save a valid request; follow View service requests.
4. Search it by equipment or requester; try a search with no matches.
5. Change Open to In Progress; filter by that status.
6. Add a service note, then reload. Both should remain in this browser.
7. Check mobile navigation and dark mode.

## Important limits
This is a browser-only learning prototype, not the completed project. localStorage is temporary demonstration persistence; it does not meet the MySQL or MongoDB requirements. Different origins or browsers do not share records. No authentication is present. Use fictional data only.
The original main.js contact/review handlers are inactive on the converted pages because their old form IDs are absent. Remove those obsolete handlers when both developers agree on shared-file cleanup.

## Integration contract to agree with John
- MySQL: sites, equipment, service_requests (request ID, equipment ID, requester, priority, issue, status, created timestamp).
- MongoDB: service_notes (requestId, author, text, createdAt).
- Node.js: GET /api/equipment; GET/POST /api/requests; PATCH /api/requests/:id; GET/POST /api/requests/:id/notes.
- Return server-generated IDs/timestamps. Validate requests on the server, confirm equipment/request existence, and show success only after saving.
- Replace load/save in service-tracker.js with API calls. Split notes from request records at that point.
- John currently owns MySQL and initial server setup; Matthew owns forms/JavaScript and MongoDB. Request-table routes need coordination, since the form writes MySQL data.

## Suggested Git contribution
Create a feature branch such as matthew/service-request-prototype.
Review this copy against the latest repository first. Include the two converted pages, new script, this note, and agreed branding/navigation edits. Do not overwrite newer teammate work using the entire ZIP.
Suggested commit: Add security service request and notes prototype.
