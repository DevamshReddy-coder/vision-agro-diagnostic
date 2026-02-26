import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const existing = await this.findByEmail(userData.email);
        if (existing) {
            throw new ConflictException('A terminal is already registered with that ID.');
        }

        const newUser = this.usersRepository.create(userData);
        return this.usersRepository.save(newUser);
    }
}
