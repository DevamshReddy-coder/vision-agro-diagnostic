import { Controller, Post, Body, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private otpService: OtpService,
    ) { }

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

    @Public()
    @Post('google')
    @ApiOperation({ summary: 'Authenticate using Google OAuth token' })
    async googleLogin(@Body() body: { token: string }) {
        if (!body.token) {
            throw new HttpException('Missing Google ID token', HttpStatus.BAD_REQUEST);
        }
        return this.authService.googleLogin(body.token);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Invalidates session token' })
    async logout() {
        // In production: add token to Redis blacklist here
        return { status: 'success', message: 'Session terminated successfully.' };
    }

    // ── OTP: Send ─────────────────────────────────────────────────────────────
    @Public()
    @Post('otp/send')
    @ApiOperation({ summary: 'Send OTP to mobile number via SMS (Twilio)' })
    @ApiBody({ schema: { properties: { phone: { type: 'string', example: '9876543210' } } } })
    async sendOtp(@Body() body: { phone: string }) {
        if (!body.phone) {
            throw new HttpException('Phone number is required.', HttpStatus.BAD_REQUEST);
        }
        const result = await this.otpService.sendOtp(body.phone);
        return {
            success: true,
            message: 'OTP sent successfully to your mobile number.',
            ...(result.dev_otp ? { dev_otp: result.dev_otp } : {}), // Only exposed in dev mode
        };
    }

    // ── OTP: Verify ───────────────────────────────────────────────────────────
    @Public()
    @Post('otp/verify')
    @ApiOperation({ summary: 'Verify OTP submitted by user' })
    @ApiBody({ schema: { properties: { phone: { type: 'string' }, otp: { type: 'string', example: '123456' } } } })
    async verifyOtp(@Body() body: { phone: string; otp: string }) {
        if (!body.phone || !body.otp) {
            throw new HttpException('Phone number and OTP are required.', HttpStatus.BAD_REQUEST);
        }
        await this.otpService.verifyOtp(body.phone, body.otp);
        return { success: true, message: 'Phone number verified successfully.' };
    }
}
