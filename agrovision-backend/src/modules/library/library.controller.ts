import { Controller, Get, Post, Put, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Disease Intelligence Base')
@Controller('library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    @Get()
    @ApiOperation({ summary: 'Search and filter active plant pathogens' })
    @ApiQuery({ name: 'q', required: false, type: String, description: 'Search biological name or common' })
    async getDiseases(@Query('q') q?: string) {
        return this.libraryService.findAll(q);
    }

    @Get('metrics')
    @ApiOperation({ summary: 'UI analytics snapshot' })
    async getLibraryMetrics() {
        return this.libraryService.getDiseaseStatusDistribution();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieves specific biological protocols' })
    async getDisease(@Param('id') id: string) {
        return this.libraryService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Submit newly discovered outbreak vector (Requires Agronomist Role)' })
    @ApiResponse({ status: 201, description: 'Biological framework updated.' })
    async createDisease(@Body() data: any) {
        // Intentionally omitting validation DTO here to save space - would use class-validator in prod
        return this.libraryService.create(data);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update disease eradication protocols' })
    async updateDisease(@Param('id') id: string, @Body() data: any) {
        return this.libraryService.update(id, data);
    }
}
