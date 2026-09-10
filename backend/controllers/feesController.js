const pool = require('../config/database');

// Get all fees
exports.getFees = async (req, res) => {
    try {
        const {
            student_id,
            fee_month,
            status
        } = req.query;

        let query = `
            SELECT
                sf.student_fee_id,
                sf.student_id,
                s.student_code,
                CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name,
                sf.fee_month,
                sf.hostel_fee,
                sf.mess_fee,
                sf.electricity_fee,
                sf.maintenance_fee,
                sf.other_fee,
                sf.discount_amount,
                sf.total_amount,
                sf.paid_amount,
                (sf.total_amount - sf.paid_amount) AS pending_amount,
                sf.due_date,
                sf.status
            FROM student_fees sf
            INNER JOIN students s
                ON s.student_id = sf.student_id
            WHERE 1 = 1
        `;

        const params = [];

        if (student_id) {
            params.push(student_id);
            query += ` AND sf.student_id = $${params.length}`;
        }

        if (fee_month) {
            params.push(fee_month);
            query += ` AND sf.fee_month = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND sf.status = $${params.length}`;
        }

        query += `
            ORDER BY sf.fee_month DESC, sf.student_fee_id DESC
        `;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            message: 'Fees fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch fees',
            error: error.message
        });
    }
};


// Get fees for one student
exports.getStudentFees = async (req, res) => {
    try {
        const { studentId } = req.params;

        const result = await pool.query(`
            SELECT
                sf.student_fee_id,
                sf.student_id,
                sf.fee_month,
                sf.hostel_fee,
                sf.mess_fee,
                sf.electricity_fee,
                sf.maintenance_fee,
                sf.other_fee,
                sf.discount_amount,
                sf.total_amount,
                sf.paid_amount,
                (sf.total_amount - sf.paid_amount) AS pending_amount,
                sf.due_date,
                sf.status
            FROM student_fees sf
            WHERE sf.student_id = $1
            ORDER BY sf.fee_month ASC
        `, [studentId]);

        res.json({
            success: true,
            message: 'Student fees fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch student fees',
            error: error.message
        });
    }
};


// Get total pending amount for student
exports.getStudentPending = async (req, res) => {
    try {
        const { studentId } = req.params;

        const result = await pool.query(
            `SELECT get_student_pending_amount($1) AS pending_amount`,
            [studentId]
        );

        res.json({
            success: true,
            message: 'Pending amount fetched successfully',
            data: {
                student_id: Number(studentId),
                pending_amount: Number(result.rows[0].pending_amount || 0)
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending amount',
            error: error.message
        });
    }
};


// Generate monthly fees
exports.generateMonthlyFees = async (req, res) => {
    try {
        const { fee_month } = req.body;

        if (!fee_month) {
            return res.status(400).json({
                success: false,
                message: 'fee_month is required'
            });
        }

        const result = await pool.query(
            `SELECT generate_monthly_hostel_fees($1) AS generated_count`,
            [fee_month]
        );

        res.json({
            success: true,
            message: 'Monthly fees generated successfully',
            data: {
                generated_count: Number(
                    result.rows[0].generated_count || 0
                )
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to generate monthly fees',
            error: error.message
        });
    }
};