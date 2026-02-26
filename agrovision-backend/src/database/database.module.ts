import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5434'),
            username: process.env.DATABASE_USER || 'agro_user',
            password: process.env.DATABASE_PASSWORD || 'secure_pwd',
            database: process.env.DATABASE_NAME || 'agrovision_core',
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV !== 'production', // true for rapid development; false in prod!
            logging: false,
        }),
    ],
})
export class DatabaseModule { }
