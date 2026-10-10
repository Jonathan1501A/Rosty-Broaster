import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;

try {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'RostyBroaster',
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000
  });

  pool.connect((err, client, release) => {
    if (err) {
      console.warn('⚠️ [PostgreSQL]: Base de datos local desconectada. El servidor opera en modo Store reactivo seguro en memoria.');
      return;
    }
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL de RostyBroaster');
    if (release) release();
  });

  pool.on('error', (err) => {
    console.warn('⚠️ [PostgreSQL Alerta]:', err.message);
  });
} catch (error) {
  console.warn('⚠️ [PostgreSQL]: No se pudo inicializar el pool, usando almacenamiento seguro en memoria:', error.message);
}

export default pool;
