import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
            ...(process.env.DATABASE_URL
                ? {
                    url: process.env.DATABASE_URL,
                    ssl: { rejectUnauthorized: false }
                }
                : {
                    database: 'data.sqlite'
                }),
            autoLoadEntities: true,
            synchronize: true, // Auto-create tables in-memory/postgres
            logging: false,
        } as any),
    ],
})
export class DatabaseModule { }
