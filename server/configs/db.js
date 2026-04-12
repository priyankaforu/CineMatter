import pg from 'pg';
import dotenv from 'dotenv';
const {Pool} = pg;

dotenv.config();
const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.localhost,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
});

export default pool;
