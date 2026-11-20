const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  multipleStatements: true,
};

async function runSqlFile(connection, filePath) {
  console.log(`[Migrate] Running file: ${filePath}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  await connection.query(sql);
  console.log(`[Migrate] Completed: ${path.basename(filePath)}`);
}

async function main() {
  const args = process.argv.slice(2);
  const doSetup = args.includes('--setup') || args.includes('--all') || args.length === 0;
  const doSeed = args.includes('--seed') || args.includes('--all') || args.length === 0;

  console.log(`[Migrate] Connecting to MySQL at ${config.host}:${config.port}...`);
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('[Migrate] Connected to MySQL successfully.');

    if (doSetup) {
      const schemaPath = path.join(__dirname, 'schema.sql');
      await runSqlFile(connection, schemaPath);
    }

    if (doSeed) {
      const seedPath = path.join(__dirname, 'seed.sql');
      await runSqlFile(connection, seedPath);
    }

    console.log('[Migrate] All database operations finished successfully.');
  } catch (error) {
    console.error('[Migrate] Error executing migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
