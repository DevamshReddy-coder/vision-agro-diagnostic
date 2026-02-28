import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport, DiagnosticStatus } from './entities/diagnostic-report.entity';

@Injectable()
export class InferenceService {
    constructor(
        @InjectQueue('inference_queue') private readonly inferenceQueue: Queue,
        @InjectRepository(DiagnosticReport) private readonly reportRepo: Repository<DiagnosticReport>,
    ) { }

    async submitAnalysisJob(userId: string, tempImageUrl: string, base64Image?: string, mimeType?: string): Promise<DiagnosticReport> {
        try {
            // 1. Create Placeholder DB Record (Status: QUEUED)
            const newReport = this.reportRepo.create({
                userId,
                imageUrl: tempImageUrl,
                status: DiagnosticStatus.QUEUED,
            });

            const savedReport = await this.reportRepo.save(newReport);

            // 2. Offload to async job processor using Kafka/Redis BullMQ
            console.log(`[Queue] Adding Job to Redis/Kafka: ${savedReport.id}`);
            await this.inferenceQueue.add('analyze_image', {
                reportId: savedReport.id,
                imageUrl: tempImageUrl,
                base64Image,
                mimeType
            }, {
                removeOnComplete: true, // Auto flush standard jobs after completion
                attempts: 2,           // Retry if the neural network times out
            });

            return savedReport; // Return early, don't block the HTTP request!
        } catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Failed to enqueue diagnostic task');
        }
    }

    async getReportStatus(reportId: string): Promise<DiagnosticReport> {
        const record = await this.reportRepo.findOne({ where: { id: reportId } });
        if (!record) {
            throw new InternalServerErrorException('Report not found tracking id ' + reportId);
        }
        return record;
    }
}
