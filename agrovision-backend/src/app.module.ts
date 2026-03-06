import { Module, MiddlewareConsumer } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
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
        // 1. Structured JSON logging with Pino
        LoggerModule.forRoot({
            pinoHttp: {
                transport: process.env.NODE_ENV !== 'production'
                    ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
                    : undefined, // Use raw JSON in production for log aggregators
                level: process.env.LOG_LEVEL || 'info',
                serializers: {
                    req: (req) => ({ method: req.method, url: req.url, id: req.id }),
                    res: (res) => ({ statusCode: res.statusCode }),
                },
            },
        }),

        // 2. API Rate Limiting: max 30 requests per 60 seconds per IP
        ThrottlerModule.forRoot([{
            ttl: 60000, // 60 seconds
            limit: 30,
        }]),

        // 3. PostreSQL Connection Pool via TypeORM
        DatabaseModule,

        // 4. Global Redis connection for Queues (BullMQ)
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

        // 5. Feature Modules:
        AuthModule,
        UsersModule,
        TelemetryModule,
        GatewayModule,
        InferenceModule,
        AnalyticsModule,
        LibraryModule,
    ],
    controllers: [],
    providers: [
        // Global rate limit guard applied to ALL routes
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
