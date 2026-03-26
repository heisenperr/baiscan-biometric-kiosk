import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Calibration } from "./entity/Calibration";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Calibration],
    migrations: [],
    subscribers: [],
});

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    throw new Error('Database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are not defined');
}
