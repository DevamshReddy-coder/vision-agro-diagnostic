import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);
    private redis: Redis;
    private twilioClient: any;

    constructor() {
        // Initialize Redis for OTP storage with TTL
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            const url = new URL(redisUrl);
            this.redis = new Redis({
                host: url.hostname,
                port: parseInt(url.port || '6379'),
                password: url.password,
                tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
            });
        } else {
            this.redis = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            });
        }

        // Initialize Twilio client if credentials are set
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (accountSid && authToken) {
            const twilio = require('twilio');
            this.twilioClient = twilio(accountSid, authToken);
            this.logger.log('✅ Twilio SMS client initialized');
        } else {
            this.logger.warn('⚠️ Twilio credentials not found - OTP will be logged to console only (development mode)');
        }
    }

    /** Generate, store, and send OTP to the given phone number */
    async sendOtp(phone: string): Promise<{ success: boolean; dev_otp?: string }> {
        // Normalize phone: strip extra whitespace
        const normalizedPhone = phone.replace(/\s/g, '').replace(/^0/, '');
        const e164Phone = normalizedPhone.startsWith('+') ? normalizedPhone : `+91${normalizedPhone}`;

        // Validate Indian mobile number format
        if (!/^\+91[6-9]\d{9}$/.test(e164Phone)) {
            throw new BadRequestException(`Invalid Indian mobile number: ${e164Phone}. Must be a valid 10-digit number starting with 6-9.`);
        }

        // Rate limit: 1 OTP per mobile per 60 seconds
        const rateLimitKey = `otp:rateLimit:${e164Phone}`;
        const rateLimited = await this.redis.get(rateLimitKey);
        if (rateLimited) {
            throw new BadRequestException('Please wait 60 seconds before requesting another OTP.');
        }

        // Generate secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store OTP in Redis with 5 minute expiry
        const otpKey = `otp:verify:${e164Phone}`;
        await this.redis.set(otpKey, otp, 'EX', 300); // 5 minutes TTL
        await this.redis.set(rateLimitKey, '1', 'EX', 60); // 60 second rate limit

        if (this.twilioClient) {
            // Send real SMS via Twilio
            await this.twilioClient.messages.create({
                body: `Your AgroVision AI verification code is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: e164Phone,
            });
            this.logger.log(`📱 OTP sent via Twilio to ${e164Phone.slice(0, 6)}****`);
            return { success: true };
        } else {
            // Development fallback: log to console
            this.logger.warn(`📱 [DEV MODE] OTP for ${e164Phone}: ${otp}`);
            return { success: true, dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined };
        }
    }

    /** Verify the OTP submitted by the user */
    async verifyOtp(phone: string, otp: string): Promise<boolean> {
        const normalizedPhone = phone.replace(/\s/g, '').replace(/^0/, '');
        const e164Phone = normalizedPhone.startsWith('+') ? normalizedPhone : `+91${normalizedPhone}`;

        const otpKey = `otp:verify:${e164Phone}`;
        const storedOtp = await this.redis.get(otpKey);

        if (!storedOtp) {
            throw new BadRequestException('OTP expired. Please request a new one.');
        }
        if (storedOtp !== otp) {
            throw new BadRequestException('Incorrect OTP. Please try again.');
        }

        // Delete OTP after successful verification (one-time use)
        await this.redis.del(otpKey);
        return true;
    }
}
