import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5434'),
            username: process.env.DATABASE_USER || 'agro_user',
            password: process.env.DATABASE_PASSWORD || 'secure_pwd',
            database: process.env.DATABASE_NAME || 'agrovision_core',
            autoLoadEntities: true,
            synchronize: true, // Set to true temporarily so Render constructs the missing Postgres tables!
            logging: false,
            ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
        }),
    ],
})
export class DatabaseModule { }
