import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;

try {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const isSslNeeded = process.env.NODE_ENV === 'production' || 
                        connectionString.includes('render.com') || 
                        connectionString.includes('supabase') || 
                        connectionString.includes('neon.tech');

    pool = new Pool({
      connectionString,
      ssl: isSslNeeded ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000
    });
    console.log('📡 [PostgreSQL]: Configurado pool con DATABASE_URL remota.');
  } else if (process.env.DB_USER || process.env.DB_HOST) {
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'RostyBroaster',
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000
    });
  }

  if (pool) {
    pool.connect((err, client, release) => {
      if (err) {
        console.warn('⚠️ [PostgreSQL]: Base de datos no conectada. El servidor opera en modo Store reactivo seguro en memoria/disco.');
        return;
      }
      console.log('✅ Conexión exitosa a la base de datos PostgreSQL persistente');
      if (release) release();
    });

    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Alerta]:', err.message);
    });
  }
} catch (error) {
  console.warn('⚠️ [PostgreSQL]: No se pudo inicializar el pool, usando almacenamiento local:', error.message);
}

export default pool;
