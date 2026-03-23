import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    mname?: string;

    @Column()
    lname!: string;

    @Column({ nullable: true })
    suffix?: string;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true })
    phone_number?: string;

    @Column({
        type: "enum",
        enum: ["male", "female", "other"],
        nullable: true
    })
    sex?: string;

    @Column({ nullable: true })
    age?: number;

    @Column({ nullable: true })
    country_code?: string;

    @Column()
    password!: string;

    @Column({
        type: "enum",
        enum: ["admin", "user"],
        default: "user"
    })
    role!: string;

    @Column({ type: "text", nullable: true })
    refresh_token?: string;

    @CreateDateColumn()
    created_at!: Date;
}
