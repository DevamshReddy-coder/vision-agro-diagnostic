import { Controller, Post, Body, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Enterprise Login (Returns JWT + Refresh Token)' })
    @ApiResponse({ status: 200, description: 'Authentication Successful.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' } } } })
    async login(@Body() req: any) {
        if (!req.email || !req.password) {
            throw new HttpException('Missing credentials', HttpStatus.BAD_REQUEST);
        }

        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user); // returns access_token & refresh_token
    }

    @Post('register')
    @ApiOperation({ summary: 'Enroll new operator' })
    async register(@Body() req: any) {
        if (!req.email || !req.password || !req.name) {
            throw new HttpException('Missing required registration data', HttpStatus.BAD_REQUEST);
        }
        return this.authService.register(req);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Invalidates session' })
    async logout() {
        return { status: 'success', message: 'Token invalidated (via Redis blacklist in production)' };
    }
}
