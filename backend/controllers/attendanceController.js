const pool = require('../config/database');

// =====================================================
// GET ATTENDANCE
// =====================================================
exports.getAttendance = async (req, res) => {
    try {
        const { date, student_id } = req.query;

        let query = `
            SELECT
                a.attendance_id,
                a.student_id,
                s.student_code,
                s.first_name,
                s.last_name,
                a.attendance_date,
                a.status,
                a.remarks,
                a.created_at
            FROM attendance a
            INNER JOIN students s
                ON s.student_id = a.student_id
            WHERE 1 = 1
        `;

        const params = [];

        if (date) {
            params.push(date);
            query += ` AND a.attendance_date = $${params.length}`;
        }

        if (student_id) {
            params.push(student_id);
            query += ` AND a.student_id = $${params.length}`;
        }

        query += `
            ORDER BY a.attendance_date DESC,
                     s.first_name,
                     s.last_name
        `;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            message: 'Attendance fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Attendance Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance',
            error: error.message
        });
    }
};


// =====================================================
// GET STUDENTS FOR ATTENDANCE
// =====================================================
exports.getStudentsForAttendance = async (req, res) => {
    try {
        const { date } = req.query;

        const attendanceDate = date || new Date()
            .toISOString()
            .split('T')[0];

        const result = await pool.query(`
            SELECT
                s.student_id,
                s.student_code,
                s.first_name,
                s.last_name,
                s.mobile_number,

                r.room_number,
                b.bed_number,

                COALESCE(
                    a.status,
                    'NOT_MARKED'
                ) AS attendance_status,

                a.remarks

            FROM students s

            LEFT JOIN room_allocations ra
                ON ra.student_id = s.student_id
               AND ra.status = 'ACTIVE'

            LEFT JOIN beds b
                ON b.bed_id = ra.bed_id

            LEFT JOIN rooms r
                ON r.room_id = b.room_id

            LEFT JOIN attendance a
                ON a.student_id = s.student_id
               AND a.attendance_date = $1

            WHERE s.status = 'ACTIVE'

            ORDER BY
                r.room_number NULLS LAST,
                b.bed_number NULLS LAST,
                s.first_name
        `, [attendanceDate]);

        res.json({
            success: true,
            message: 'Students fetched for attendance',
            attendance_date: attendanceDate,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Attendance Students Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch students for attendance',
            error: error.message
        });
    }
};


// =====================================================
// MARK ATTENDANCE
// =====================================================
exports.markAttendance = async (req, res) => {
    try {
        const {
            student_id,
            attendance_date,
            status,
            remarks
        } = req.body;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'student_id is required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'status is required'
            });
        }

        const validStatuses = [
            'PRESENT',
            'ABSENT',
            'LEAVE'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance status'
            });
        }

        const date =
            attendance_date ||
            new Date().toISOString().split('T')[0];

        // Check student
        const studentResult = await pool.query(`
            SELECT student_id
            FROM students
            WHERE student_id = $1
        `, [student_id]);

        if (studentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Insert or update
        const result = await pool.query(`
            INSERT INTO attendance (
                student_id,
                attendance_date,
                status,
                remarks
            )
            VALUES ($1, $2, $3, $4)

            ON CONFLICT (
                student_id,
                attendance_date
            )

            DO UPDATE SET
                status = EXCLUDED.status,
                remarks = EXCLUDED.remarks

            RETURNING *
        `, [
            student_id,
            date,
            status,
            remarks || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Mark Attendance Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to mark attendance',
            error: error.message
        });
    }
};


// =====================================================
// BULK ATTENDANCE
// =====================================================
exports.markBulkAttendance = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            attendance_date,
            attendance
        } = req.body;

        if (!attendance_date) {
            return res.status(400).json({
                success: false,
                message: 'attendance_date is required'
            });
        }

        if (!Array.isArray(attendance) || attendance.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'attendance array is required'
            });
        }

        await client.query('BEGIN');

        let count = 0;

        for (const item of attendance) {

            if (!item.student_id || !item.status) {
                continue;
            }

            if (
                !['PRESENT', 'ABSENT', 'LEAVE']
                    .includes(item.status)
            ) {
                continue;
            }

            await client.query(`
                INSERT INTO attendance (
                    student_id,
                    attendance_date,
                    status,
                    remarks
                )
                VALUES ($1, $2, $3, $4)

                ON CONFLICT (
                    student_id,
                    attendance_date
                )

                DO UPDATE SET
                    status = EXCLUDED.status,
                    remarks = EXCLUDED.remarks
            `, [
                item.student_id,
                attendance_date,
                item.status,
                item.remarks || null
            ]);

            count++;
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Bulk attendance saved successfully',
            count
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Bulk Attendance Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to save bulk attendance',
            error: error.message
        });

    } finally {
        client.release();
    }
};


// =====================================================
// STUDENT ATTENDANCE SUMMARY
// =====================================================
exports.getStudentAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        const {
            from_date,
            to_date
        } = req.query;

        const result = await pool.query(`
            SELECT
                COUNT(*) AS total_days,

                COUNT(
                    CASE
                        WHEN status = 'PRESENT'
                        THEN 1
                    END
                ) AS present_days,

                COUNT(
                    CASE
                        WHEN status = 'ABSENT'
                        THEN 1
                    END
                ) AS absent_days,

                COUNT(
                    CASE
                        WHEN status = 'LEAVE'
                        THEN 1
                    END
                ) AS leave_days,

                ROUND(
                    (
                        COUNT(
                            CASE
                                WHEN status = 'PRESENT'
                                THEN 1
                            END
                        )::NUMERIC
                        /
                        NULLIF(COUNT(*), 0)
                    ) * 100,
                    2
                ) AS attendance_percentage

            FROM attendance

            WHERE student_id = $1

              AND (
                    $2::DATE IS NULL
                    OR attendance_date >= $2
                  )

              AND (
                    $3::DATE IS NULL
                    OR attendance_date <= $3
                  )
        `, [
            studentId,
            from_date || null,
            to_date || null
        ]);

        res.json({
            success: true,
            message: 'Attendance summary fetched successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Attendance Summary Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance summary',
            error: error.message
        });
    }
};