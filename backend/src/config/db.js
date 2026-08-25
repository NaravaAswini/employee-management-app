import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;
let useMemoryFallback = false;

// In-memory mock data store as fallback if MySQL server is not yet running locally
export const mockData = {
  users: [],
  employees: [
    {
      id: 1,
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (555) 234-5678',
      department: 'Engineering',
      salary: 95000.00,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Michael Chang',
      email: 'michael.chang@example.com',
      phone: '+1 (555) 876-5432',
      department: 'Product',
      salary: 105000.00,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 345-6789',
      department: 'Marketing',
      salary: 78000.00,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'David Patel',
      email: 'david.patel@example.com',
      phone: '+1 (555) 456-7890',
      department: 'Finance',
      salary: 88000.00,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Amara Okafor',
      email: 'amara.okafor@example.com',
      phone: '+1 (555) 678-1234',
      department: 'Human Resources',
      salary: 72000.00,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  nextUserId: 1,
  nextEmployeeId: 6
};

export function isFallbackMode() {
  return useMemoryFallback;
}

export async function initDB() {
  const dbConfig = process.env.DATABASE_URL
    ? { uri: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'employee_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
      };

  try {
    // If not using full URI, ensure database exists first
    if (!process.env.DATABASE_URL) {
      try {
        const rootConnection = await mysql.createConnection({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password
        });
        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await rootConnection.end();
      } catch (err) {
        console.warn(`[DB Warning] Could not auto-create database: ${err.message}`);
      }
    }

    pool = mysql.createPool(dbConfig);

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connected successfully to MySQL Database!');
    connection.release();

    // Create Tables
    await createTables();
    useMemoryFallback = false;
    return pool;
  } catch (error) {
    console.warn(`\n⚠️  [MySQL Warning] Could not connect to MySQL server (${error.message}).`);
    console.warn(`👉 Switching automatically to High-Fidelity In-Memory Data Store so your API runs seamlessly.`);
    console.warn(`👉 Once MySQL is running locally or configured on Render, it will use MySQL persistence automatically.\n`);
    useMemoryFallback = true;
    return null;
  }
}

async function createTables() {
  if (!pool) return;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(320) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createEmployeesTable = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(320) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      department VARCHAR(80) NOT NULL,
      salary DECIMAL(12, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await pool.query(createUsersTable);
  await pool.query(createEmployeesTable);

  // Seed sample data if empty
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM employees');
  if (rows[0].count === 0) {
    console.log('🌱 Seeding initial sample employees into MySQL...');
    const seedQuery = `
      INSERT INTO employees (name, email, phone, department, salary) VALUES
      ('Sarah Jenkins', 'sarah.jenkins@example.com', '+1 (555) 234-5678', 'Engineering', 95000.00),
      ('Michael Chang', 'michael.chang@example.com', '+1 (555) 876-5432', 'Product', 105000.00),
      ('Elena Rostova', 'elena.rostova@example.com', '+1 (555) 345-6789', 'Marketing', 78000.00),
      ('David Patel', 'david.patel@example.com', '+1 (555) 456-7890', 'Finance', 88000.00),
      ('Amara Okafor', 'amara.okafor@example.com', '+1 (555) 678-1234', 'Human Resources', 72000.00);
    `;
    await pool.query(seedQuery);
    console.log('✅ Initial employees seeded successfully!');
  }
}

export function getPool() {
  return pool;
}
