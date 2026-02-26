import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryData } from './entities/telemetry.entity';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TelemetryData]),
        GatewayModule, // Telemetry Service broadcasts on this WebSocket Gateway
    ],
    providers: [TelemetryService],
    controllers: [TelemetryController],
    exports: [TelemetryService],
})
export class TelemetryModule { }
