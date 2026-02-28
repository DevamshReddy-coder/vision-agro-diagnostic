import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 1. Security Headers
    app.use(helmet());

    // 2. CORS configuration for frontend clients
    app.enableCors({
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
        credentials: true,
    });

    // 3. Global Route Prefix and Versioning
    app.setGlobalPrefix('api/v1');

    // 4. Global Validation Pipe (Input Validation & Stripping)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,        // Strip unknown properties
            forbidNonWhitelisted: true, // Throw error on unknown properties
            transform: true,        // Transform payloads to DTO instances
        }),
    );

    // 5. Swagger API Documentation Setup
    const config = new DocumentBuilder()
        .setTitle('AgroVision AI API')
        .setDescription('The core agricultural intelligence backend API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);

    // 6. Server Initialization
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`🚀 AgroVision AI Core Architecture running on port ${port}`);
}

bootstrap();
