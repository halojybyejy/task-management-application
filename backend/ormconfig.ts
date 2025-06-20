import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
    type: 'postgres',
    url: process.env.SUPABASE_URL,
    // For local development and migration
    //   host: process.env.DB_HOST || 'localhost',
    //   port: parseInt(process.env.DB_PORT || '5433'),
    //   username: process.env.DB_USERNAME || 'postgres',
    //   password: process.env.DB_PASSWORD || 'postgres',
    //   database: process.env.DB_DATABASE || 'task_management_app',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

