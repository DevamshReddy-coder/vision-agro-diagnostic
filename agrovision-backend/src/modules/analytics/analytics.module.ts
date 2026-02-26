import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

// Dependencies on other modules' schemas to aggregate system-wide data
import { DiagnosticReport } from '../inference/entities/diagnostic-report.entity';
import { TelemetryData } from '../telemetry/entities/telemetry.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DiagnosticReport,
            TelemetryData
        ])
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService]
})
export class AnalyticsModule { }
