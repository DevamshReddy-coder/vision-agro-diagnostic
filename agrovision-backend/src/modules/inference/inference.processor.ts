import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport, DiagnosticStatus } from './entities/diagnostic-report.entity';
import { TelemetryGateway } from '../../gateway/telemetry.gateway';

@Processor('inference_queue')
@Injectable()
export class InferenceProcessor extends WorkerHost {
    constructor(
        @InjectRepository(DiagnosticReport)
        private readonly reportRepo: Repository<DiagnosticReport>,
        private readonly gateway: TelemetryGateway,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const reportId = job.data.reportId;
        console.log(`[AI Worker] Starting inference for Job ID: ${job.id}, Report ID: ${reportId}`);

        // Update DB to Processing
        await this.reportRepo.update(reportId, { status: DiagnosticStatus.PROCESSING });

        // Emit real-time status update to frontend
        this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 10 });

        // Simulate Heavy Neural Net Inference (Wait 4 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.gateway.server.emit('inference_progress', { reportId, status: 'PROCESSING', progress: 65 });

        // Additional simulated processing
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Determine mocked result
        const results = [
            { name: 'Tomato Late Blight', confidence: 96.4 },
            { name: 'Healthy Leaf', confidence: 99.1 },
            { name: 'Wheat Rust Warning', confidence: 88.2 }
        ];
        const pick = results[Math.floor(Math.random() * results.length)];

        // Update DB to Complete
        await this.reportRepo.update(reportId, {
            status: DiagnosticStatus.COMPLETED,
            diseasePredictedName: pick.name,
            confidenceScore: pick.confidence,
        });

        console.log(`[AI Worker] Finished inference for Report ID: ${reportId}. Result: ${pick.name}`);

        // Final emission
        this.gateway.server.emit('inference_progress', {
            reportId,
            status: 'COMPLETED',
            result: pick
        });

        return { reportId, outcome: pick };
    }
}
