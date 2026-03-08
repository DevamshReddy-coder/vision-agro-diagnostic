import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);
    private otpCache = new Map<string, { otp: string, expiresAt: number }>();
    private rateLimitCache = new Map<string, number>();

    constructor() {
        if (process.env.FAST2SMS_API_KEY) {
            this.logger.log('✅ Fast2SMS API Key initialized');
        } else {
            this.logger.warn('⚠️ Fast2SMS API Key not found - OTP will be logged to console only (development mode)');
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
        const rateLimitExp = this.rateLimitCache.get(rateLimitKey);
        if (rateLimitExp && rateLimitExp > Date.now()) {
            throw new BadRequestException('Please wait 60 seconds before requesting another OTP.');
        }

        // Generate secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store OTP in Map with 5 minute expiry
        const otpKey = `otp:verify:${e164Phone}`;
        this.otpCache.set(otpKey, { otp, expiresAt: Date.now() + 300000 }); // 5 minutes TTL
        this.rateLimitCache.set(rateLimitKey, Date.now() + 60000); // 60 second rate limit

        if (process.env.FAST2SMS_API_KEY) {
            try {
                const fast2sms = require('fast-two-sms');
                const response = await fast2sms.sendMessage({
                    authorization: process.env.FAST2SMS_API_KEY,
                    message: `Your AgroVision AI verification code is: ${otp}`,
                    numbers: [normalizedPhone]
                });

                if (response.return === false) {
                    throw new Error(response.message || 'Fast2SMS returned an error');
                }

                this.logger.log(`📱 OTP sent via Fast2SMS to ${e164Phone.slice(0, 6)}****`);
                return { success: true };
            } catch (err) {
                this.logger.error(`Failed to send Fast2SMS OTP: ${err.message}`);
                throw new BadRequestException('Failed to send real SMS. Please try again.');
            }
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
        const stored = this.otpCache.get(otpKey);

        if (!stored || stored.expiresAt < Date.now()) {
            this.otpCache.delete(otpKey);
            throw new BadRequestException('OTP expired. Please request a new one.');
        }
        if (stored.otp !== otp) {
            throw new BadRequestException('Incorrect OTP. Please try again.');
        }

        // Delete OTP after successful verification (one-time use)
        this.otpCache.delete(otpKey);
        return true;
    }
}
