import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'data.sqlite',
            autoLoadEntities: true,
            synchronize: true, // Auto-create tables in-memory
            logging: false,
        }),
    ],
})
export class DatabaseModule { }
