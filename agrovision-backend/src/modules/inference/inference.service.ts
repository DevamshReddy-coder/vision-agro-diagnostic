import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport, DiagnosticStatus } from './entities/diagnostic-report.entity';
import { InferenceProcessor } from './inference.processor';

@Injectable()
export class InferenceService {
    constructor(
        private readonly inferenceProcessor: InferenceProcessor,
        @InjectRepository(DiagnosticReport) private readonly reportRepo: Repository<DiagnosticReport>,
    ) { }

    async submitAnalysisJob(userId: string, tempImageUrl: string, base64Image?: string, mimeType?: string, lat?: string, lon?: string, cropType?: string): Promise<DiagnosticReport> {
        try {
            // 1. Create Placeholder DB Record (Status: QUEUED)
            const newReport = this.reportRepo.create({
                userId,
                imageUrl: tempImageUrl,
                status: DiagnosticStatus.QUEUED,
            });

            const savedReport = await this.reportRepo.save(newReport);

            // 2. Offload to async job processor bypassing BullMQ to avoid Redis dependency
            console.log(`[Queue] Executing async inference job inline: ${savedReport.id}`);

            // Execute in background without awaiting to free up the HTTP request
            this.inferenceProcessor.process({
                reportId: savedReport.id,
                imageUrl: tempImageUrl,
                base64Image,
                mimeType,
                lat,
                lon,
                cropType
            }).catch(e => console.error("Background processing failed:", e));

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
