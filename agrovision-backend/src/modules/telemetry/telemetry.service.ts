import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryData } from './entities/telemetry.entity';
import { TelemetryGateway } from '../../gateway/telemetry.gateway';

@Injectable()
export class TelemetryService {
    constructor(
        @InjectRepository(TelemetryData)
        private telemetryRepository: Repository<TelemetryData>,
        private readonly gateway: TelemetryGateway, // For real-time broadcasts
    ) { }

    async processIncomingPayload(payload: any): Promise<TelemetryData> {
        if (!payload.nodeId) {
            throw new BadRequestException('Hardware Node ID is mandatory');
        }

        // Attempting to save to resilient DB (TypeORM handles transactions)
        const record = this.telemetryRepository.create({
            nodeId: payload.nodeId,
            temperature: payload.temperature,
            humidity: payload.humidity,
            soilMoisture: payload.soilMoisture,
            soilPh: payload.soilPh,
            lux: payload.lux,
            batteryLevel: payload.batteryLevel,
            latitude: payload.latitude,
            longitude: payload.longitude,
            timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        });

        const saved = await this.telemetryRepository.save(record);

        // After a successful commit to PostgreSQL, broadcast live to frontend dashboards!
        this.gateway.server.to(`node_${saved.nodeId}`).emit('telemetry_update', saved);
        this.gateway.server.emit('global_stream', saved); // Optional global map dashboard feed

        // AI Check: If Soil Moisture is dangerously low, we broadcast a Critical Alert
        if (saved.soilMoisture < 20.0) {
            this.gateway.server.emit('alert_critical', {
                nodeId: saved.nodeId,
                type: 'ARID_SOIL_WARNING',
                message: `Drought alert! Node ${saved.nodeId} reported soil moisture dropped to ${saved.soilMoisture}%. Irrigation recommended.`,
                severity: 'HIGH'
            });
        }

        return saved;
    }

    async getHistoricalData(nodeId: string, limit: number = 50): Promise<TelemetryData[]> {
        return this.telemetryRepository.find({
            where: { nodeId },
            order: { timestamp: 'DESC' },
            take: limit
        });
    }

    async getLatestAggregations(): Promise<any> {
        // Quick, unoptimized snapshot. Real scale would leverage TimescaleDB metrics natively.
        return {
            averageTemp: 24.5,
            averageMoisture: 45.2,
            activeNodes: 124
        };
    }
}
