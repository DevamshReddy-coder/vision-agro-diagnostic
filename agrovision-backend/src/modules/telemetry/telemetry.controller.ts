import { Controller, Post, Body, Get, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Telemetry/Hardware Interface')
@Controller('telemetry')
export class TelemetryController {
    constructor(private readonly telemetryService: TelemetryService) { }

    @Post('ingest')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Edge device bulk/single data payload entrypoint' })
    @ApiResponse({ status: 201, description: 'Payload stored to distributed Timescale ledger and rebroadcasted over pub/sub.' })
    async ingestData(@Body() payload: any) {
        return this.telemetryService.processIncomingPayload(payload);
    }

    @Get('nodes/:nodeId')
    @ApiOperation({ summary: 'Fetch timeline history of specific agricultural drone/hardware unit.' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getDeviceHistory(@Param('nodeId') nodeId: string, @Query('limit') limit: string) {
        return this.telemetryService.getHistoricalData(nodeId, limit ? parseInt(limit) : 50);
    }

    @Get('dashboard/aggregate')
    @ApiOperation({ summary: 'Macro environmental metrics for UI summary cards.' })
    async getAggregations() {
        return this.telemetryService.getLatestAggregations();
    }
}
