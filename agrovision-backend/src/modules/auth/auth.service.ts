import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

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
}
