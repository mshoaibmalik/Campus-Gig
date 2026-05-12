# CampusGig Project Analysis & Admin Setup

## Project Overview

**CampusGig** is a marketplace application connecting students to gig opportunities on campus. It leverages blockchain (smart contracts) for escrow management and uses modern web technologies for frontend and backend services.

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | React 19 with TypeScript |
| **Router** | TanStack Router (formerly React Router) |
| **Build Tool** | Vite with TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **UI Components** | Radix UI + Tailwind CSS |
| **State Management** | TanStack Query (React Query) |
| **Backend** | TanStack Start with Cloudflare Workers |
| **Smart Contracts** | Solidity (Ethereum) |
| **Form Handling** | React Hook Form with Zod validation |
| **Deployment** | Cloudflare Workers (via Wrangler) |

---

## Project Structure

```
d:\LocabyteHackathonSHU/
├── contracts/              # Smart Contracts
│   └── CampusGigEscrow.sol # Escrow contract for gig payments
├── src/                    # Application source code
│   ├── components/         # React components
│   │   ├── AppShell.tsx    # Main app layout
│   │   ├── ConnectWalletModal.tsx
│   │   ├── GigCard.tsx
│   │   └── ui/            # Radix UI components
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External integrations
│   │   └── supabase/      # Supabase client setup
│   ├── routes/            # TanStack Router routes
│   │   ├── __root.tsx
│   │   ├── auth.tsx
│   │   ├── index.tsx
│   │   └── _app/          # Protected routes
│   ├── router.tsx         # Router configuration
│   ├── server.ts          # Server setup
│   └── styles.css         # Global styles
├── supabase/              # Supabase configuration
│   ├── config.toml        # Project config
│   └── migrations/        # Database migrations
├── prisma/                # (Empty - not used in this project)
├── public/                # Static assets
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

---

## Database Schema

### Tables

#### 1. **profiles**
Stores user profile information linked to auth.users.
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id)
  university_email text UNIQUE NOT NULL
  full_name text
  department text
  skills text[]
  bio text
  avatar_url text
  balance numeric(12,2)
  wallet_address text
  created_at timestamptz
  updated_at timestamptz
)
```

#### 2. **user_roles**
Assigns roles (admin, student) to users.
```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY
  user_id uuid REFERENCES auth.users(id)
  role app_role ('admin' | 'student')
  created_at timestamptz
  UNIQUE(user_id, role)
)
```

#### 3. **gigs**
Represents available gig opportunities.
```sql
CREATE TABLE public.gigs (
  id uuid PRIMARY KEY
  seller_id uuid REFERENCES auth.users(id)
  buyer_id uuid REFERENCES auth.users(id)
  title text NOT NULL
  description text NOT NULL
  image_url text
  price numeric(12,2)
  category text NOT NULL
  skills text[]
  delivery_days int
  status gig_status ('OPEN' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED')
  created_at timestamptz
  updated_at timestamptz
)
```

#### 4. **transactions**
Tracks gig payments and escrow status.
```sql
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY
  gig_id uuid REFERENCES gigs(id)
  buyer_id uuid REFERENCES auth.users(id)
  seller_id uuid REFERENCES auth.users(id)
  escrow_amount numeric(12,2)
  status text ('HELD' | ...)
  tx_hash text
  created_at timestamptz
)
```

### Key Functions

- **has_role(user_id, role)**: Checks if user has a specific role
- **claim_admin_if_none()**: Allows first user to claim admin role
- **handle_new_user()**: Automatically creates profile and assigns 'student' role on user signup
- **set_updated_at()**: Updates the `updated_at` timestamp on table modifications

---

## Admin User Setup

### ✅ Admin User Created

**Credentials:**
- **Email:** admin@smiu.edu.pk
- **Password:** campus@gig321
- **Role:** admin
- **Status:** Verified and ready to use

### Admin Capabilities

With the admin role, the user can:
✅ Delete any gig  
✅ Update any gig  
✅ View all transactions  
✅ Update any user profile  
✅ Manage user roles  

### Setup Methods

Three methods were provided to add the admin user:

#### **Method 1: Supabase Dashboard (Recommended for One-Time Setup)**
- Navigate to https://app.supabase.com/
- Create user in Authentication > Users
- Assign admin role via SQL Editor

#### **Method 2: Supabase CLI**
```bash
supabase auth admin create-user --email admin@smiu.edu.pk --password campus@gig321
# Then assign role via SQL
```

#### **Method 3: Node.js Seed Script**
```bash
# Add to .env.local:
SUPABASE_SERVICE_ROLE_KEY=your-key-here

# Run:
npm run seed:admin
```

---

## Key Features

### Authentication & Authorization
- ✅ Supabase Auth with email/password
- ✅ Row-Level Security (RLS) policies
- ✅ Role-based access control (admin/student)
- ✅ Middleware for protected routes

### Gig Management
- ✅ Create, read, update, delete gigs
- ✅ Search gigs by category and skills
- ✅ Status tracking (Open, Active, Completed, Disputed, Cancelled)
- ✅ Admin can manage all gigs

### Transactions & Escrow
- ✅ Blockchain-backed escrow system
- ✅ Transaction tracking
- ✅ Escrow amount management
- ✅ Admin visibility of all transactions

### User Management
- ✅ Automatic profile creation on signup
- ✅ User wallet integration
- ✅ Balance tracking
- ✅ Admin profile management

### UI/UX
- ✅ Responsive design with Tailwind CSS
- ✅ Modern Radix UI components
- ✅ Dark mode support (TBD)
- ✅ Loading states and error handling

---

## File Overview

### Core Application Files

| File | Purpose |
|------|---------|
| `src/server.ts` | TanStack Start server setup |
| `src/router.tsx` | Main router configuration |
| `src/routes/__root.tsx` | Root layout and global setup |
| `src/routes/auth.tsx` | Authentication page |
| `src/routes/_app/dashboard.tsx` | Student dashboard |
| `src/routes/_app/admin.tsx` | Admin dashboard |
| `src/routes/_app/gigs/` | Gig listing and management |
| `src/components/AppShell.tsx` | Main app layout shell |
| `src/integrations/supabase/` | Supabase client setup |

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |
| `wrangler.jsonc` | Cloudflare Workers config |
| `tailwind.config.js` | Tailwind CSS configuration |

### Database Files

| File | Purpose |
|------|---------|
| `supabase/config.toml` | Supabase project ID |
| `supabase/migrations/` | Database schema migrations |

---

## Environment Variables

### Required in `.env`
```env
SUPABASE_URL=https://nnmkadvwpudqorabbmem.supabase.co
SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_URL=https://nnmkadvwpudqorabbmem.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

### Required in `.env.local` (For Admin Setup Script)
```env
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Get Service Role Key:**
1. Go to https://app.supabase.com/
2. Select project `nnmkadvwpudqorabbmem`
3. Settings > API
4. Copy "Service Role Secret"

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Production build
npm run build:dev        # Development build

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Admin Setup
npm run seed:admin       # Create admin user (requires .env.local)
```

---

## Deployment

The app is configured to deploy to **Cloudflare Workers** using Wrangler.

```bash
# Deploy to Cloudflare
npm run build
wrangler deploy
```

---

## Security Considerations

✅ **Row-Level Security (RLS)** enabled on all tables  
✅ **Service role key** kept in `.env.local` (never committed)  
✅ **Auth middleware** protects sensitive routes  
✅ **Policies** enforce user access restrictions  
✅ **Email verification** required for user accounts  

⚠️ **Important:** After admin creation, change the password for security.

---

## Next Steps

1. **Start the development server:**
   ```bash
   npm install
   npm run dev
   ```

2. **Create the admin user** using one of the three methods

3. **Test admin features:**
   - Login as admin@smiu.edu.pk
   - Verify admin access to protected features

4. **Configure blockchain integration:**
   - Deploy CampusGigEscrow.sol to your test network
   - Update contract address in the app

---

## Contact & Support

For issues or questions about this project, refer to the migration files for database schema details or the source code for implementation details.

**Project ID:** nnmkadvwpudqorabbmem  
**Created:** May 12, 2026
