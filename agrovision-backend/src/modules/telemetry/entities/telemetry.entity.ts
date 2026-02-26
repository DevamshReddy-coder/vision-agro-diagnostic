import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('telemetry_data')
@Index(['nodeId', 'timestamp']) // Optimize searching for specific field nodes geographically
export class TelemetryData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'node_id' })
    @Index()
    nodeId: string; // The physical hardware ID (e.g. sensor_beta_99)

    @Column('float', { nullable: true })
    temperature: number; // Celsius

    @Column('float', { nullable: true })
    humidity: number; // Percentage

    @Column('float', { name: 'soil_moisture', nullable: true })
    soilMoisture: number; // Percentage

    @Column('float', { name: 'soil_ph', nullable: true })
    soilPh: number;

    @Column('float', { nullable: true })
    lux: number; // Light Intensity

    @Column({ name: 'battery_level', type: 'int', nullable: true })
    batteryLevel: number; // 0-100

    // Optional: Geospatial column for advanced mapping (can be added later via PostGIS)
    @Column('float', { nullable: true })
    latitude: number;

    @Column('float', { nullable: true })
    longitude: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date; // Important since devices might batch upload historical metrics when offline

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date; // When the server actually received the payload
}
