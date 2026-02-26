import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ default: 'Farmer' }) // 'Farmer', 'Agronomist', 'Admin'
    role: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
            // Basic safeguard: Only hash if it's plaintext currently
            this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.passwordHash);
    }
}
