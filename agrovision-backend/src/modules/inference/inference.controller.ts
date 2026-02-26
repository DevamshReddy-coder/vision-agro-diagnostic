import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InferenceService } from './inference.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

@ApiTags('AI Inference Pipeline')
@Controller('inference')
export class InferenceController {
    constructor(private readonly inferenceService: InferenceService) { }

    @Post('analyze')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Submit high-res crop specimen for neural mapping (Async job)' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 202, description: 'Job accepted into processing queue. Returns reportId for status polling or socket subscription.' })
    @UseInterceptors(FileInterceptor('file')) // Simulating multer interceptor 
    async submitAnalysis(@UploadedFile() file: Express.Multer.File) {
        // 1. Mock file upload to S3. Imagine this returns a URL to the stored asset.
        console.log(`[Diagnostic Lab] Received Specimen: ${file?.originalname || 'MockImage.jpg'}`);
        const mockS3Url = `https://s3.agrovision.ai/specimens/${crypto.randomUUID()}.jpg`;

        // 2. The user would typically come from JwtAuthGuard.req.user
        const mockUserId = 'uuid-agronomist-123';

        // 3. Queue the job in the backend service
        const report = await this.inferenceService.submitAnalysisJob(mockUserId, mockS3Url);

        // 4. Return immediately to front-end to avoid blocking HTTP requests while inference runs
        return {
            message: 'Specimen queued for deep analysis.',
            reportId: report.id,
            status: report.status,
        };
    }

    @Get('jobs/:reportId')
    @ApiOperation({ summary: 'Poll inference status if WebSockets are unavailable.' })
    async checkJobStatus(@Param('reportId') reportId: string) {
        const report = await this.inferenceService.getReportStatus(reportId);
        return { status: report.status, result: report.diseasePredictedName, confidence: report.confidenceScore };
    }
}
