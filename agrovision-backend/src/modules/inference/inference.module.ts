import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { InferenceController } from './inference.controller';
import { InferenceService } from './inference.service';
import { InferenceProcessor } from './inference.processor';
import { DiagnosticReport } from './entities/diagnostic-report.entity';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DiagnosticReport]),
        BullModule.registerQueue({
            name: 'inference_queue',
            // The connection to Redis is configured globally in app.module.ts
        }),
        GatewayModule, // To allow processor to broadcast via telemetry.gateway.ts
    ],
    controllers: [InferenceController],
    providers: [InferenceService, InferenceProcessor],
    exports: [InferenceService],
})
export class InferenceModule { }
