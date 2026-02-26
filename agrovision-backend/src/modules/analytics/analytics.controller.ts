import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Analytics Dashboard')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('health-overview')
    @ApiOperation({ summary: 'High-level crop health and severity distributions' })
    async getHealthOverview() {
        return this.analyticsService.getHealthOverview();
    }

    @Get('overview')
    @ApiOperation({ summary: 'UI specific overview for React Analytics Dashboard' })
    async getOverview() {
        return this.analyticsService.getOverview();
    }

    @Get('environmental-impact')
    @ApiOperation({ summary: 'Correlates environmental factors with disease risks' })
    @ApiQuery({ name: 'days', required: false, type: Number, description: 'Lookback period' })
    async getEnvironmentalImpact(@Query('days') days?: number) {
        return this.analyticsService.getEnvironmentalImpact(days || 7);
    }

    @Get('system-status')
    @ApiOperation({ summary: 'Platform operational metrics for the terminal interface' })
    async getSystemStatus() {
        return this.analyticsService.getSystemStatus();
    }
}
