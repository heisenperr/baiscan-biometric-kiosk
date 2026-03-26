import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from "typeorm";

@Entity("calibration")
@Index(["sensor_name"])
export class Calibration {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
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
