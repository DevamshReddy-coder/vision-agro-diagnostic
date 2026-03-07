import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async register(data: any) {
        // Assume simple data wrapper here. In prod, DTO validation happens in Controller
        const user = await this.usersService.create({
            name: data.name,
            email: data.email,
            passwordHash: await bcrypt.hash(data.password, 10), // Service layer fallback
            role: data.role || 'Farmer'
        });

        return this.login(user);
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }), // Long-lived refresh token
            user: {
                id: user.id || user.sub,
                name: user.name || "Operator",
                email: user.email,
                role: user.role,
            }
        };
    }

    async googleLogin(token: string) {
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new UnauthorizedException('Google OAuth is not configured on this server.');
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new UnauthorizedException('Invalid Google token payload');
            }

            let user = await this.usersService.findByEmail(payload.email);
            if (!user) {
                // Auto-register the Google user
                user = await this.usersService.create({
                    name: payload.name || 'Google User',
                    email: payload.email,
                    passwordHash: await bcrypt.hash(crypto.randomUUID(), 10), // Random locked password
                    role: 'Farmer', // Default role for OAuth
                });
            }

            return this.login(user);
        } catch (error) {
            console.error('[Google OAuth Error]:', error);
            throw new UnauthorizedException('Google authentication failed');
        }
    }
}
