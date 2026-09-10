const pool = require('../config/database');


// Get payments
exports.getPayments = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                fp.payment_id,
                fp.student_id,
                s.student_code,
                CONCAT(
                    s.first_name,
                    ' ',
                    COALESCE(s.last_name, '')
                ) AS student_name,
                fp.payment_date,
                fp.amount,
                fp.payment_mode,
                fp.reference_number,
                fp.receipt_number,
                fp.remarks,
                fp.created_at
            FROM fee_payments fp
            INNER JOIN students s
                ON s.student_id = fp.student_id
            ORDER BY fp.payment_date DESC,
                     fp.payment_id DESC
        `);

        res.json({
            success: true,
            message: 'Payments fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments',
            error: error.message
        });
    }
};


// Get payments of one student
exports.getStudentPayments = async (req, res) => {
    try {

        const { studentId } = req.params;

        const result = await pool.query(`
            SELECT
                fp.payment_id,
                fp.student_id,
                fp.payment_date,
                fp.amount,
                fp.payment_mode,
                fp.reference_number,
                fp.receipt_number,
                fp.remarks,
                fp.created_at
            FROM fee_payments fp
            WHERE fp.student_id = $1
            ORDER BY fp.payment_date DESC,
                     fp.payment_id DESC
        `, [studentId]);

        res.json({
            success: true,
            message: 'Student payments fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch student payments',
            error: error.message
        });
    }
};


// Post payment
exports.postPayment = async (req, res) => {
    try {

        const {
            student_id,
            amount,
            payment_mode,
            reference_number,
            remarks
        } = req.body;


        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'student_id is required'
            });
        }


        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid payment amount is required'
            });
        }


        if (!payment_mode) {
            return res.status(400).json({
                success: false,
                message: 'payment_mode is required'
            });
        }


        const result = await pool.query(
            `
            SELECT post_student_fee_payment(
                $1,
                $2,
                $3,
                $4,
                $5
            ) AS payment_id
            `,
            [
                student_id,
                amount,
                payment_mode,
                reference_number || null,
                remarks || null
            ]
        );


        const paymentId = result.rows[0].payment_id;


        const paymentResult = await pool.query(
            `
            SELECT
                fp.*,
                CONCAT(
                    s.first_name,
                    ' ',
                    COALESCE(s.last_name, '')
                ) AS student_name
            FROM fee_payments fp
            INNER JOIN students s
                ON s.student_id = fp.student_id
            WHERE fp.payment_id = $1
            `,
            [paymentId]
        );


        res.status(201).json({
            success: true,
            message: 'Payment posted successfully',
            data: paymentResult.rows[0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to post payment',
            error: error.message
        });
    }
};


// Get payment allocation details
exports.getPaymentAllocations = async (req, res) => {
    try {

        const { paymentId } = req.params;

        const result = await pool.query(`
            SELECT
                fpa.allocation_id,
                fpa.payment_id,
                fpa.student_fee_id,
                sf.fee_month,
                fpa.allocated_amount
            FROM fee_payment_allocations fpa
            INNER JOIN student_fees sf
                ON sf.student_fee_id = fpa.student_fee_id
            WHERE fpa.payment_id = $1
            ORDER BY sf.fee_month
        `, [paymentId]);


        res.json({
            success: true,
            message: 'Payment allocations fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment allocations',
            error: error.message
        });
    }
};


module.exports = exports;