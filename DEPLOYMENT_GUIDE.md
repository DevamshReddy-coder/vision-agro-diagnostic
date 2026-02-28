# AgroVision AI - Production Deployment Pipeline

Alright DevamshReddy, your local architecture is **perfect**. To take this entire application global to `https://github.com/DevamshReddy-coder`, you need to execute the following pipeline. Our entire codebase is already committed locally with Git.

## Phase 1: Push to GitHub Core 🚀
Since you don't have the `gh` console CLI logged in locally, you must create the repository manually and link it.

1. Go to [github.com/new](https://github.com/new) and log in as `DevamshReddy-coder`.
2. Name the repository **`vision-agro-diagnostic`** and make it Public.
3. Once created, run these exact three commands in your terminal here in VS Code:
```bash
git branch -M main
git remote add origin https://github.com/DevamshReddy-coder/vision-agro-diagnostic.git
git push -u origin main
```
Boom. The whole full-stack system is now live on your GitHub.

---

## Phase 2: Deploy the Front-End (Vercel) 🌐
Vercel is the ultimate host for Next.js applications and gives you an instant free `*.vercel.app` link.

1. Go to [Vercel.com](https://vercel.com/) and log in with your GitHub account.
2. Click **Add New Project** and select `vision-agro-diagnostic` from your GitHub repos.
3. Under **Framework Preset**, ensure it says `Next.js`.
4. Under **Root Directory**, click edit and select the `client` folder.
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `(Your future backend Render link goes here, but leave it blank or as your local 'http://localhost:5000/api/v1' for now)`
6. Click **Deploy**. In 2 minutes, you will get your final public link (e.g., `https://vision-agro-diagnostic.vercel.app`).

---

## Phase 3: Deploy the Back-End & Database (Render) 🧠
Because your NestJS backend requires PostgreSQL and Redis, Render is the perfect environment.

1. Go to [Render.com](https://render.com/) and log in with GitHub.
2. **Setup PostgreSQL**: Click `New` -> `PostgreSQL`. Give it a name (`agrovision-db`) and create it. It will give you an Internal Database URL.
3. **Setup Redis**: Click `New` -> `Redis`. Give it a name (`agrovision-cache`) and create it.
4. **Deploy Node Server**: Click `New` -> `Web Service`. Connect your GitHub repo.
   - For **Root Directory**, type: `agrovision-backend`
   - For **Build Command**, type: `npm install && npm run build`
   - For **Start Command**, type: `npm run start:prod`
5. In the **Environment Variables** section on Render, paste the URLs it just generated for you:
   - `DATABASE_HOST` / `PORT` / `USER` / `PASSWORD` (from the PostgreSQL dashboard)
   - `REDIS_URL` (from the Redis dashboard)
6. Click **Deploy**.

**You are now officially a Senior Full Stack Engineer with a live enterprise SaaS architecture!**
