#!/usr/bin/env node
/**
 * Turso Auth Token Rotation Script
 * 
 * This script rotates the Turso auth token by:
 * 1. Creating a new token via Turso API
 * 2. Updating the DATABASE_URL in environment (requires manual update)
 * 3. Optionally revoking the old token
 * 
 * Prerequisites:
 * - TURSO_API_TOKEN environment variable (org-level API token)
 * - TURSO_ORG_NAME environment variable
 * - TURSO_DATABASE_NAME environment variable
 * 
 * Usage:
 *   npm run rotate:turso-token
 * 
 * Schedule with cron:
 *   0 2 * * 0 /path/to/project/scripts/rotate-turso-token.ts  # Weekly on Sunday 2AM
 */

import { createClient } from '@libsql/client';

interface TursoTokenResponse {
  token: string;
  expiresAt: string;
  createdAt: string;
}

async function rotateTursoToken(): Promise<void> {
  const orgName = process.env.TURSO_ORG_NAME;
  const dbName = process.env.TURSO_DATABASE_NAME;
  const apiToken = process.env.TURSO_API_TOKEN;

  if (!orgName || !dbName || !apiToken) {
    console.error('Missing required environment variables:');
    console.error('  TURSO_ORG_NAME');
    console.error('  TURSO_DATABASE_NAME');
    console.error('  TURSO_API_TOKEN');
    process.exit(1);
  }

  console.log('🔄 Starting Turso token rotation...');

  try {
    // 1. Create new token via Turso API
    console.log('📝 Creating new auth token...');
    const createResponse = await fetch(
      `https://api.turso.io/v1/organizations/${orgName}/databases/${dbName}/tokens`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Optional: set expiration (e.g., 90 days)
          // expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create token: ${createResponse.status} ${error}`);
    }

    const newTokenData: TursoTokenResponse = await createResponse.json();
    const newToken = newTokenData.token;

    console.log('✅ New token created successfully');
    console.log(`   Token: ${newToken.slice(0, 8)}...${newToken.slice(-8)}`);
    console.log(`   Expires: ${newTokenData.expiresAt || 'Never (manual rotation required)'}`);

    // 2. Construct new DATABASE_URL
    const newDatabaseUrl = `libsql://${dbName}-${orgName}.turso.io?authToken=${newToken}`;
    console.log('\n📋 New DATABASE_URL:');
    console.log(newDatabaseUrl);

    // 3. Test the new token
    console.log('\n🧪 Testing new token...');
    const testClient = createClient({
      url: `libsql://${dbName}-${orgName}.turso.io?authToken=${newToken}`,
    });
    
    await testClient.execute('SELECT 1');
    console.log('✅ New token works correctly');

    // 4. Output instructions
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Update your environment variables with the new DATABASE_URL');
    console.log('2. Deploy/restart your application');
    console.log('3. Verify the application works with the new token');
    console.log('4. Optionally revoke the old token after confirming everything works');
    console.log('\n⚠️  IMPORTANT: Do NOT revoke the old token until you have confirmed');
    console.log('   the new token works in production!');

    // 5. Optional: List existing tokens (for manual revocation)
    console.log('\n📋 Current tokens (for reference):');
    const listResponse = await fetch(
      `https://api.turso.io/v1/organizations/${orgName}/databases/${dbName}/tokens`,
      {
        headers: { 'Authorization': `Bearer ${apiToken}` },
      }
    );
    
    if (listResponse.ok) {
      const tokens = await listResponse.json();
      console.log(JSON.stringify(tokens, null, 2));
    }

  } catch (error) {
    console.error('❌ Token rotation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  rotateTursoToken();
}

export { rotateTursoToken };