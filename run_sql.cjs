const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:Panda@aloui1206@db.gfppeehyeuhhcvtnbpmt.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function run() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected to Supabase DB');
    const sql = fs.readFileSync('database_schema.sql', 'utf8');
    await client.query(sql);
    console.log('SQL executed successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
