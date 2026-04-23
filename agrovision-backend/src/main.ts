import * as dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/node';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

async function bootstrap() {
    // 0. Initialize Sentry Error Tracking (before anything else)
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: 1.0,
        });
        console.log('[Sentry] Initialized - Error tracking active.');
    }

    const app = await NestFactory.create(AppModule, {
        bufferLogs: true, // Buffer logs until Pino logger is attached
    });

    // 1. Structured JSON Logging (Pino) - replaces console.log in production
    app.useLogger(app.get(Logger));

    // 2. Security Headers
    app.use(helmet());

    // 3. CORS configuration for frontend clients
    app.enableCors({
        origin: true, // Dynamically allow originating domain (safe for this project scope)
        credentials: true,
    });

    // 4. Global Route Prefix and Versioning
    app.setGlobalPrefix('api/v1');

    // 5. Global Validation Pipe (Input Validation & Stripping)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // 6. Global JWT Auth Guard - protect all routes, mark public ones with @Public()
    const jwtService = app.get(JwtService);
    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(jwtService, reflector));

    // 7. Swagger API Documentation
    const config = new DocumentBuilder()
        .setTitle('AgroVision AI API')
        .setDescription('The core agricultural intelligence backend API')
        .setVersion('2.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);

    // 8. Server Initialization
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`🚀 AgroVision AI Core Architecture running on port ${port}`);
    console.log(`📖 API Docs: http://localhost:${port}/api/v1/docs`);
}

bootstrap().catch(err => {
    console.error('❌ CRITICAL BOOTSTRAP ERROR:', err);
    process.exit(1);
});
