const pool = require('../config/database');

// =====================================================
// GET ALL STUDENTS
// =====================================================
const getStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                student_id,
                student_code,
                first_name,
                last_name,
                gender,
                date_of_birth,
                mobile_number,
                alternate_mobile,
                email,
                college_name,
                course_name,
                academic_year,
                guardian_name,
                guardian_mobile,
                address,
                emergency_contact_name,
                emergency_contact_number,
                joining_date,
                leaving_date,
                status,
                created_at,
                updated_at
            FROM students
            ORDER BY student_id DESC
        `);

        res.status(200).json({
            success: true,
            message: 'Students fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Students Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
            error: error.message
        });
    }
};


// =====================================================
// GET STUDENT BY ID
// =====================================================
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                student_id,
                student_code,
                first_name,
                last_name,
                gender,
                date_of_birth,
                mobile_number,
                alternate_mobile,
                email,
                college_name,
                course_name,
                academic_year,
                guardian_name,
                guardian_mobile,
                address,
                emergency_contact_name,
                emergency_contact_number,
                joining_date,
                leaving_date,
                status,
                created_at,
                updated_at
            FROM students
            WHERE student_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Student Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch student',
            error: error.message
        });
    }
};


// =====================================================
// CREATE STUDENT
// =====================================================
const createStudent = async (req, res) => {
    try {
        const {
            student_code,
            first_name,
            last_name,
            gender,
            date_of_birth,
            mobile_number,
            alternate_mobile,
            email,
            college_name,
            course_name,
            academic_year,
            guardian_name,
            guardian_mobile,
            address,
            emergency_contact_name,
            emergency_contact_number,
            joining_date
        } = req.body;

        // Required fields
        if (!student_code || !first_name || !mobile_number) {
            return res.status(400).json({
                success: false,
                message: 'student_code, first_name and mobile_number are required'
            });
        }

        // Check duplicate student code
        const existingStudent = await pool.query(`
            SELECT student_id
            FROM students
            WHERE student_code = $1
        `, [student_code]);

        if (existingStudent.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Student code already exists'
            });
        }

        const result = await pool.query(`
            INSERT INTO students (
                student_code,
                first_name,
                last_name,
                gender,
                date_of_birth,
                mobile_number,
                alternate_mobile,
                email,
                college_name,
                course_name,
                academic_year,
                guardian_name,
                guardian_mobile,
                address,
                emergency_contact_name,
                emergency_contact_number,
                joining_date,
                status
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, COALESCE($17::DATE, CURRENT_DATE),
                'ACTIVE'
            )
            RETURNING *
        `, [
            student_code,
            first_name,
            last_name || null,
            gender || null,
            date_of_birth || null,
            mobile_number,
            alternate_mobile || null,
            email || null,
            college_name || null,
            course_name || null,
            academic_year || null,
            guardian_name || null,
            guardian_mobile || null,
            address || null,
            emergency_contact_name || null,
            emergency_contact_number || null,
            joining_date || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Create Student Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create student',
            error: error.message
        });
    }
};


// =====================================================
// UPDATE STUDENT
// =====================================================
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            student_code,
            first_name,
            last_name,
            gender,
            date_of_birth,
            mobile_number,
            alternate_mobile,
            email,
            college_name,
            course_name,
            academic_year,
            guardian_name,
            guardian_mobile,
            address,
            emergency_contact_name,
            emergency_contact_number,
            joining_date,
            leaving_date,
            status
        } = req.body;

        const result = await pool.query(`
            UPDATE students
            SET
                student_code = $1,
                first_name = $2,
                last_name = $3,
                gender = $4,
                date_of_birth = $5,
                mobile_number = $6,
                alternate_mobile = $7,
                email = $8,
                college_name = $9,
                course_name = $10,
                academic_year = $11,
                guardian_name = $12,
                guardian_mobile = $13,
                address = $14,
                emergency_contact_name = $15,
                emergency_contact_number = $16,
                joining_date = $17,
                leaving_date = $18,
                status = $19,
                updated_at = CURRENT_TIMESTAMP
            WHERE student_id = $20
            RETURNING *
        `, [
            student_code,
            first_name,
            last_name || null,
            gender || null,
            date_of_birth || null,
            mobile_number,
            alternate_mobile || null,
            email || null,
            college_name || null,
            course_name || null,
            academic_year || null,
            guardian_name || null,
            guardian_mobile || null,
            address || null,
            emergency_contact_name || null,
            emergency_contact_number || null,
            joining_date || null,
            leaving_date || null,
            status || 'ACTIVE',
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update Student Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update student',
            error: error.message
        });
    }
};


// =====================================================
// DELETE / DEACTIVATE STUDENT
// =====================================================
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            UPDATE students
            SET
                status = 'INACTIVE',
                leaving_date = COALESCE(leaving_date, CURRENT_DATE),
                updated_at = CURRENT_TIMESTAMP
            WHERE student_id = $1
            RETURNING student_id, student_code, status
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student deactivated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Delete Student Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to deactivate student',
            error: error.message
        });
    }
};


module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};