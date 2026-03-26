import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity("calibration")
export class Calibration {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    sensor_name!: string;

    @Column("float")
    reference_unit!: number;

    @Column("float")
    offset!: number;

    @Column({ type: "text", nullable: true })
    notes?: string;

    @UpdateDateColumn()
    updated_at!: Date;

    @CreateDateColumn()
    created_at!: Date;
}
