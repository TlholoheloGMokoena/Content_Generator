# ContentFlow AI

Static front end (`public/index.html`) plus one serverless function (`api/generate.js`) that calls the Anthropic API.

## Deploy
1. Push this folder to a GitHub repo.
2. In Vercel: Add New > Project > import the repo. Leave framework as "Other"; no build command.
3. Settings > Environment Variables: add `ANTHROPIC_API_KEY` (from console.anthropic.com). Optional: `ANTHROPIC_MODEL`.
4. Deploy (or redeploy after adding the variable).

## Notes
- Anyone who opens the site can trigger generations billed to your key. Before sharing publicly, add rate limiting (e.g. Upstash Ratelimit) or require login.
- Accounts, history and favorites are stored in each visitor's browser (localStorage) only.
