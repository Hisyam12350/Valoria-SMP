const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

async function getSupabaseSchema() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
  const apikey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch schema: ${res.status} ${res.statusText}`);
    }
    const schema = await res.json();
    
    if (schema.definitions) {
      console.log('\n"transactions" Table schema:');
      console.log(JSON.stringify(schema.definitions.transactions, null, 2));

      console.log('\n"payment_logs" Table schema:');
      console.log(JSON.stringify(schema.definitions.payment_logs, null, 2));
    }
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

getSupabaseSchema();
