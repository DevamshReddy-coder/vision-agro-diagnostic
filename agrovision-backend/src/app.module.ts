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

import { AppController } from './app.controller';

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

        // 4. Global Redis connection bypassed for inline synchronous ML queue

        // 5. Feature Modules:
        AuthModule,
        UsersModule,
        TelemetryModule,
        GatewayModule,
        InferenceModule,
        AnalyticsModule,
        LibraryModule,
    ],
    controllers: [AppController],
    providers: [
        // Global rate limit guard applied to ALL routes
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
