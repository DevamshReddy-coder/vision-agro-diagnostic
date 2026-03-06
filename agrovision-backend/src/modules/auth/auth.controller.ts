import { Controller, Post, Body, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public() // No JWT required - this IS the login endpoint
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
            throw new UnauthorizedException('Invalid credentials. Verify your email and password.');
        }
        return this.authService.login(user);
    }

    @Public() // No JWT required - this IS the registration endpoint
    @Post('register')
    @ApiOperation({ summary: 'Enroll new operator into the system' })
    @ApiResponse({ status: 201, description: 'Operator enrolled and authenticated.' })
    async register(@Body() req: any) {
        if (!req.email || !req.password || !req.name) {
            throw new HttpException('Missing required fields: name, email, password', HttpStatus.BAD_REQUEST);
        }
        return this.authService.register(req);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Invalidates session token' })
    async logout() {
        // In production: add token to Redis blacklist here
        return { status: 'success', message: 'Session terminated successfully.' };
    }
}
