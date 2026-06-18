# Production Deployment Guide: Supabase + Vercel
This guide outlines the step-by-step instructions for deploying and migrating the **Dhanalakshmi Food Products** e-commerce platform to a production-ready cloud database architecture using **Supabase** and **Vercel Serverless Functions**.

---

## Stage 1: Setup Supabase Database

1. **Create a Free Account & Project**:
   - Go to [Supabase](https://supabase.com) and sign in/sign up.
   - Click **New Project** and select your organization.
   - Choose a project name (e.g., `dhanalakshmi-food-products`), set a strong database password, and pick a region close to your target audience (e.g., `South Asia (Mumbai)`).

2. **Execute Database Schema Script**:
   - In the Supabase Sidebar, click on the **SQL Editor** tab (represented by `SQL` icon).
   - Click **New Query** to create a fresh SQL sheet.
   - Open [schema.sql](file:///c:/Users/sivap/OneDrive/Documents/Desktop/dhanalkshimi-food-products/schema.sql) in your code editor, copy the entire file contents, and paste it into the Supabase SQL editor window.
   - Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
   - Ensure the query executes successfully. This creates all necessary tables (`products`, `orders`, `order_items`, `shipping_rates`, `settings`), triggers, indices, and seeds the default catalog and parameters.

3. **Get API Keys & Credentials**:
   - Go to **Project Settings** (gear icon) -> **API** in the Supabase sidebar.
   - Copy the following fields to your clipboard or notes:
     1. **Project URL**: Found under `Project URL`.
     2. **service_role (secret) key**: Click **Reveal** under the `service_role` key row and copy the secret key.
        > [!WARNING]
        > Keep the `service_role` key strictly private. Do not check it into git or reveal it on public frontends. It has admin permissions and bypasses Row Level Security (RLS). Our backend Serverless API routes will use this key securely.

---

## Stage 2: Configure Environment Variables (.env)

For local development and testing, you can create a local environment file in the root of the directory:
1. Duplicate the `.env.example` file and rename it to `.env`.
2. Fill in the copied credentials from Stage 1:
   ```env
   SUPABASE_URL=https://your-supabase-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-secret-here
   ADMIN_PASSWORD=your-secure-admin-password-here
   NODE_ENV=development
   ```

---

## Stage 3: Connect to Vercel and Deploy

You can deploy the app to Vercel using the Vercel Dashboard or the Vercel CLI.

### Option A: Using the Vercel Dashboard (Recommended)

1. **Commit your changes**:
   - Push your workspace files to a private/public GitHub, GitLab, or Bitbucket repository.
2. **Import Project to Vercel**:
   - Log in to your [Vercel Dashboard](https://vercel.com).
   - Click **Add New** -> **Project**.
   - Select your Dhanalakshmi repository and click **Import**.
3. **Configure Environment Variables**:
   - Expand the **Environment Variables** section during configuration.
   - Add the following three keys exactly as defined below:
     - `SUPABASE_URL`: (Paste your Supabase Project URL)
     - `SUPABASE_SERVICE_ROLE_KEY`: (Paste your Supabase secret `service_role` key)
     - `ADMIN_PASSWORD`: (Set a secure custom password for your admin dashboard log in session)
4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend assets and automatically compile the Node.js API handlers inside the `api` folder into secure Serverless Functions.

### Option B: Using the Vercel Command Line Interface (CLI)

1. Open your terminal in the workspace directory.
2. Run `npm install -g vercel` (if Vercel CLI is not installed).
3. Log in to Vercel:
   ```bash
   vercel login
   ```
4. Link the project and deploy:
   ```bash
   vercel
   ```
   Follow the prompts to create the project.
5. Set the production environment secrets on Vercel:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add ADMIN_PASSWORD
   ```
6. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## Stage 4: Verify Your Deployment

1. **Verify Backend Connection Status**:
   - Navigate to `https://your-vercel-domain.vercel.app/api/status` in your browser.
   - You should see a JSON response confirming connectivity:
     ```json
     {
       "status": "online",
       "database": "connected"
     }
     ```

2. **Verify Customer Catalog**:
   - Visit the home page `index.html` on your production site.
   - Confirm that the catalog loads dynamically from your Supabase database.
   - In your Supabase Dashboard -> Table Editor, try updating a price in the `products` table and refreshing the home page. The price will update in real-time.

3. **Verify Admin Dashboard**:
   - Go to `https://your-vercel-domain.vercel.app/admin.html`.
   - Enter your `ADMIN_PASSWORD` into the lock screen.
   - Once authenticated, confirm that dashboard metrics, product tables, order lists, and settings load correctly from Supabase.
   - Test adding a product, deleting a product, or changing a shipping rate, and verify that the database registers these updates instantly.

---

## Operational Details & Fallback Mode

To protect user interaction, the `db.js` layer includes a **smart fallback mechanism**:
- **Connection Check**: The client checks connection health via `/api/status`.
- **Automatic Fallback**: If the server is offline (e.g. running locally via `file://` or if Vercel encounters downtime), the application automatically falls back to **LocalStorage**.
- **No Interruption**: Customers can still browse, add items to cart, and complete orders (via manual UPI details) in LocalStorage fallback mode, and administrators can still preview mock orders.
- **Secure Write Access**: All database updates, product creations, and order listings in cloud mode require the `x-admin-password` header matching the environment variable, preventing unauthorized API requests.
