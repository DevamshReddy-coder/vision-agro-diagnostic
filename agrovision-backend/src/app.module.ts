import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from './database/database.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { GatewayModule } from './gateway/gateway.module';
import { InferenceModule } from './modules/inference/inference.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LibraryModule } from './modules/library/library.module';

@Module({
    imports: [
        // 1. PostreSQL Connection Pool via TypeORM
        DatabaseModule,

        // 2. Global Redis connection for Queues (BullMQ)
        BullModule.forRoot({
            connection: process.env.REDIS_URL ? {
                host: new URL(process.env.REDIS_URL).hostname,
                port: parseInt(new URL(process.env.REDIS_URL).port || '6379'),
                password: new URL(process.env.REDIS_URL).password,
                tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
            } : {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
        }),

        // 3. Feature Modules:
        AuthModule,
        UsersModule,
        TelemetryModule,
        GatewayModule,
        InferenceModule,
        AnalyticsModule,
        LibraryModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
