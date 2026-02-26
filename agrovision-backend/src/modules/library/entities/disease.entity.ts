import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('disease_knowledge_base')
export class DiseaseLibraryEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'scientific_name', unique: true })
    scientificName: string; // Specific global identification

    @Column({ name: 'common_name' })
    commonName: string; // Presentational name e.g. "Wheat Rust"

    @Column('text')
    description: string;

    @Column({ name: 'risk_level', type: 'float', default: 50.0 })
    baseRiskLevel: number; // 0-100 score of severity

    @Column('simple-array', { nullable: true })
    affectedCrops: string[]; // ['Wheat', 'Barley']

    @Column('text', { array: true, default: [] })
    treatmentProtocols: string[]; // Text array defining immediate action to contain

    @Column('text', { array: true, default: [] })
    preventionStrategies: string[];

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string; // High res microscopic/leaf visual

    @Column({ name: 'is_active', default: true })
    isActive: boolean; // Can be toggled if eradicated globally

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
