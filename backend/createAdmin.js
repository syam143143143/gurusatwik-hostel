require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('./config/database');
const createAdmin = async () => {
    try {
        const username = 'admin';
        const password = 'Admin@123';
        const fullName = 'System Administrator';

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.query(
            `
            INSERT INTO users
            (
                username,
                password_hash,
                full_name,
                role
            )
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username)
            DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                full_name = EXCLUDED.full_name,
                role = EXCLUDED.role,
                is_active = TRUE
            `,
            [
                username,
                passwordHash,
                fullName,
                'ADMIN'
            ]
        );

        console.log('Admin user created successfully');
        console.log('Username:', username);
        console.log('Password:', password);

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('Error creating admin:', error);
        await pool.end();
        process.exit(1);
    }
};

createAdmin();








