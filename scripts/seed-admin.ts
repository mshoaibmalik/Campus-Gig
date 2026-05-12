import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';

// Try to load .env.local if it exists
const envLocalFile = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalFile)) {
  const envContent = fs.readFileSync(envLocalFile, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  console.error('   Add it to your .env or .env.local file');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('   This is your Supabase service role secret key from the project settings');
  console.error('   Add it to your .env.local file (never commit this to git!)');
  console.error('\n📋 To get your service role key:');
  console.error('   1. Go to https://app.supabase.com/');
  console.error('   2. Select your project');
  console.error('   3. Go to Settings > API');
  console.error('   4. Copy the "Service Role Secret" key');
  console.error('   5. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY="your-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedAdmin() {
  try {
    console.log('🔐 Creating admin user...');

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@smiu.edu.pk',
      password: 'campus@gig321',
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: 'Admin User',
      },
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      process.exit(1);
    }

    if (!authUser.user) {
      console.error('❌ No user returned from auth creation');
      process.exit(1);
    }

    console.log('✅ Auth user created:', authUser.user.id);
    console.log('   Email:', authUser.user.email);

    // Add admin role to user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin',
      });

    if (roleError) {
      console.error('❌ Error adding admin role:', roleError.message);
      process.exit(1);
    }

    console.log('✅ Admin role assigned successfully');
    console.log('\n🎉 Admin user created successfully!');
    console.log('   Email: admin@smiu.edu.pk');
    console.log('   Password: campus@gig321');
    console.log('   Role: admin');
    console.log('   User ID:', authUser.user.id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAdmin();
