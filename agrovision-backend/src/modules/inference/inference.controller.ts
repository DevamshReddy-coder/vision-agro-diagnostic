import {
    Controller, Post, Get, Param, UploadedFile,
    UseInterceptors, HttpCode, HttpStatus, BadRequestException, Request, Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InferenceService } from './inference.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

const IMAGE_MIME_WHITELIST = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB hard limit

@ApiTags('AI Inference Pipeline')
@ApiBearerAuth()
@Controller('inference')
export class InferenceController {
    constructor(private readonly inferenceService: InferenceService) { }

    @Post('analyze')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Submit high-res crop specimen for neural mapping (Async job)' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 202, description: 'Job accepted into processing queue. Returns reportId for WebSocket subscription.' })
    @UseInterceptors(FileInterceptor('image'))
    async submitAnalysis(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: any,
        @Body() body: any,
    ) {
        // 1. Validate file is present
        if (!file) {
            throw new BadRequestException('No image file provided. Attach a "image" field with a valid crop image.');
        }

        // 2. Validate MIME type (whitelist check)
        if (!IMAGE_MIME_WHITELIST.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type: ${file.mimetype}. Accepted types: JPEG, PNG, WebP, GIF.`
            );
        }

        // 3. Validate file size (hard 10MB cap)
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException(
                `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed size is 10MB.`
            );
        }

        const base64Image = file.buffer.toString('base64');
        const mimeType = file.mimetype;
        const lat = body.lat;
        const lon = body.lon;
        const cropType = body.cropType;

        console.log(`[Diagnostic Lab] Received specimen: ${file.originalname} (${(file.size / 1024).toFixed(0)}KB, ${mimeType}) from user ${user?.sub || 'anonymous'}`);
        if (lat && lon) console.log(`[Diagnostic Lab] Live Geolocation captured: Lat ${lat}, Lon ${lon}`);

        // 4. Use real authenticated user ID from JWT payload
        const userId = user?.sub || crypto.randomUUID();
        const mockS3Url = `https://s3.agrovision.ai/specimens/${userId}/${Date.now()}-${file.originalname}`;

        // 5. Queue the job
        const report = await this.inferenceService.submitAnalysisJob(userId, mockS3Url, base64Image, mimeType, lat, lon, cropType);

        return {
            message: 'Specimen accepted. Neural analysis pipeline initiated.',
            reportId: report.id,
            status: report.status,
            estimatedProcessingTime: '3-10 seconds',
        };
    }

    @Get('jobs/:reportId')
    @ApiOperation({ summary: 'Poll inference status if WebSockets are unavailable.' })
    async checkJobStatus(@Param('reportId') reportId: string) {
        const report = await this.inferenceService.getReportStatus(reportId);
        return {
            status: report.status,
            result: report.diseasePredictedName,
            confidence: report.confidenceScore,
            fullResult: report.status === 'COMPLETED' ? report.fullResult : null,
        };
    }
}
