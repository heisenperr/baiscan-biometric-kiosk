import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const seedAdmin = async () => {
    try {
        await AppDataSource.initialize();
        console.log("[SEED] Data Source has been initialized!");

        const userRepository = AppDataSource.getRepository(User);

        // Check if admin already exists
        const adminEmail = "admin@baiscan.com";
        const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

        if (existingAdmin) {
            console.log("[SEED] Admin account already exists. Skipping...");
        } else {
            const admin = new User();
            admin.name = "System";
            admin.lname = "Administrator";
            admin.email = adminEmail;
            admin.password = "admin123"; // Using plain-text as currently implemented in authController
            admin.role = "admin";
            admin.sex = "other";
            admin.age = 30;
            admin.country_code = "PH";

            await userRepository.save(admin);
            console.log("[SEED] Admin account created successfully!");
            console.log(`[SEED] Email: ${adminEmail}`);
            console.log(`[SEED] Password: admin123`);
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error("[SEED] Error during seeding:", error);
        process.exit(1);
    }
};

seedAdmin();
