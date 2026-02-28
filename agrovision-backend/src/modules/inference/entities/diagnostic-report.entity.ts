import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export enum DiagnosticStatus {
    QUEUED = 'QUEUED',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity('diagnostic_reports')
export class DiagnosticReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string; // Ties back to user who submitted

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string;

    @Column({ name: 'xai_map_url', nullable: true })
    xaiMapUrl: string;

    @Column({ name: 'disease_id', type: 'uuid', nullable: true })
    diseaseId: string;

    @Column({ name: 'disease_predicted_name', nullable: true })
    diseasePredictedName: string;

    @Column({ name: 'confidence_score', type: 'float', nullable: true })
    confidenceScore: number;

    @Column({ name: 'full_result', type: 'jsonb', nullable: true })
    fullResult: any;

    @Column({
        type: 'enum',
        enum: DiagnosticStatus,
        default: DiagnosticStatus.QUEUED,
    })
    status: DiagnosticStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
