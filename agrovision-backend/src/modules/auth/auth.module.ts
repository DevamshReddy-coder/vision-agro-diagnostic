import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'dev_agrovision_key_1234',
            signOptions: { expiresIn: (process.env.JWT_EXPIRATION || '15m') as any },
        }),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
