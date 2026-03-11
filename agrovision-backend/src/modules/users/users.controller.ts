import { Controller, Get, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Farmer Profile & Account Management')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('profile')
    @ApiOperation({ summary: 'Get current farmer profile and farm metadata' })
    async getProfile(@CurrentUser() user: any) {
        const fullUser = await this.usersService.findById(user.sub);
        // Exclude password hash from response
        const { passwordHash, ...result } = fullUser;
        return result;
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update farmer profile, farm size, crops, and regional settings' })
    async updateProfile(@CurrentUser() user: any, @Body() updateData: any) {
        return this.usersService.updateProfile(user.sub, updateData);
    }
}
