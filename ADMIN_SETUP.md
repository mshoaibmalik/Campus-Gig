# Admin User Setup Guide

This document explains how to add the admin user to your CampusGig application.

## Option 1: Using Supabase Dashboard (Easiest)

If you want to quickly create the admin user through the Supabase web interface:

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com/
   - Select your project `nnmkadvwpudqorabbmem`

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users"

3. **Create New User**
   - Click "Invite" or "New User"
   - Email: `admin@smiu.edu.pk`
   - Password: `campus@gig321`
   - Make sure to check "Confirm email" to auto-verify

4. **Assign Admin Role**
   - After user is created, go to "SQL Editor" in the left sidebar
   - Run this SQL query:

   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'admin@smiu.edu.pk'
   ON CONFLICT DO NOTHING;
   ```

---

## Option 2: Using Supabase CLI

**Prerequisites:**
- Install Supabase CLI: `npm install -g supabase`
- Link your project: `supabase link`

**Steps:**

1. **Create the admin user:**
   ```bash
   supabase link
   supabase auth admin create-user --email admin@smiu.edu.pk --password campus@gig321
   ```

2. **Get the user ID from the output and assign the admin role:**
   ```bash
   supabase db push  # Ensure migrations are applied
   ```

3. **Assign admin role via SQL:**
   ```bash
   supabase db execute --file - << 'EOF'
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'admin@smiu.edu.pk'
   ON CONFLICT DO NOTHING;
   EOF
   ```

---

## Option 3: Using the Seed Script (Node.js)

**Prerequisites:**
- Node.js installed
- Service Role Key from Supabase

**Steps:**

1. **Get your Service Role Key:**
   - Go to https://app.supabase.com/
   - Select your project
   - Go to Settings > API
   - Copy the "Service Role Secret"

2. **Add to .env.local:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Install dependencies:**
   ```bash
   npm install dotenv
   ```

4. **Run the seed script:**
   ```bash
   npm run seed:admin
   ```

---

## Verify Admin User Creation

After adding the admin user, verify it was created successfully:

1. **Check in Supabase Dashboard:**
   - Go to Authentication > Users
   - Look for `admin@smiu.edu.pk`

2. **Verify admin role:**
   - Go to SQL Editor
   - Run this query:
   ```sql
   SELECT u.id, u.email, ur.role
   FROM auth.users u
   LEFT JOIN public.user_roles ur ON u.id = ur.user_id
   WHERE u.email = 'admin@smiu.edu.pk';
   ```
   - You should see a row with role `admin`

---

## Admin User Details

- **Email:** admin@smiu.edu.pk
- **Password:** campus@gig321
- **Role:** admin
- **Status:** Active with confirmed email

---

## What the Admin Can Do

With the admin role, the user can:
- ✅ Delete any gig
- ✅ Update any gig
- ✅ View all transactions
- ✅ Update any user profile (e.g., adjust balance)
- ✅ Manage user roles

---

## Troubleshooting

**Error: "Invalid login credentials"**
- This means the user either does not exist yet in Supabase or the password is wrong.
- Verify `admin@smiu.edu.pk` exists under Authentication > Users.
- If it is missing, run `npm run seed:admin` after adding `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`, or create it manually in the dashboard.
- If the user exists, reset the password in Supabase Auth or recreate the account with the correct password.

**Error: "User already exists"**
- The user might already be created. Check in Authentication > Users

**Error: "Service Role Key invalid"**
- Make sure you copied the correct key from Settings > API
- The key should start with `eyJ...`

**Role not showing up**
- Wait a few seconds and refresh
- Make sure the SQL query was executed without errors

---

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to git
- The service role key is sensitive - store it securely
- Change the admin password after first login
- Consider using an authentication provider instead of password auth
