const pool = require('../config/database');

// ============================================================
// 1. OCCUPANCY REPORT
// ============================================================
const getOccupancyReport = async (req, res) => {
    try {
        const query = `
            SELECT
                room_id,
                floor_number,
                room_number,
                sharing_name,
                capacity,
                occupied_beds,
                available_beds,
                usable_beds,
                monthly_fee,
                room_status
            FROM vw_room_occupancy
            ORDER BY floor_number, room_number
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Occupancy report error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch occupancy report',
            error: error.message
        });
    }
};


// ============================================================
// 2. MONTHLY COLLECTION REPORT
// ============================================================
const getMonthlyCollectionReport = async (req, res) => {
    try {
        const { from_date, to_date } = req.query;

        let query = `
            SELECT
                DATE_TRUNC('month', sf.fee_month)::DATE AS fee_month,

                COUNT(DISTINCT sf.student_id) AS total_students,

                COALESCE(SUM(sf.total_amount), 0)::NUMERIC(12,2)
                    AS total_fee,

                COALESCE(SUM(sf.paid_amount), 0)::NUMERIC(12,2)
                    AS total_collection,

                COALESCE(
                    SUM(sf.total_amount - sf.paid_amount),
                    0
                )::NUMERIC(12,2) AS total_pending

            FROM student_fees sf
            WHERE 1 = 1
        `;

        const params = [];

        if (from_date) {
            params.push(from_date);
            query += ` AND sf.fee_month >= $${params.length}`;
        }

        if (to_date) {
            params.push(to_date);
            query += ` AND sf.fee_month <= $${params.length}`;
        }

        query += `
            GROUP BY DATE_TRUNC('month', sf.fee_month)
            ORDER BY fee_month DESC
        `;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Monthly collection report error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly collection report',
            error: error.message
        });
    }
};


// ============================================================
// 3. PENDING FEES REPORT
// ============================================================
const getPendingFeesReport = async (req, res) => {
    try {
        const query = `
            SELECT
                student_fee_id,
                student_id,
                student_code,
                student_name,
                fee_month,

                hostel_fee,
                mess_fee,
                electricity_fee,
                maintenance_fee,
                other_fee,
                discount_amount,

                total_amount,
                paid_amount,
                pending_amount,

                due_date,
                status

            FROM vw_student_fee_ledger

            WHERE pending_amount > 0

            ORDER BY
                student_name,
                fee_month
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Pending fees report error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending fees report',
            error: error.message
        });
    }
};


// ============================================================
// 4. STUDENT LEDGER REPORT
// ============================================================
const getStudentLedgerReport = async (req, res) => {
    try {
        const { student_id } = req.params;
        const { from_date, to_date } = req.query;

        const params = [student_id];

        let query = `
            SELECT
                student_fee_id,
                student_id,
                student_code,
                student_name,
                fee_month,

                hostel_fee,
                mess_fee,
                electricity_fee,
                maintenance_fee,
                other_fee,
                discount_amount,

                total_amount,
                paid_amount,
                pending_amount,

                due_date,
                status

            FROM vw_student_fee_ledger

            WHERE student_id = $1
        `;

        if (from_date) {
            params.push(from_date);
            query += ` AND fee_month >= $${params.length}`;
        }

        if (to_date) {
            params.push(to_date);
            query += ` AND fee_month <= $${params.length}`;
        }

        query += `
            ORDER BY fee_month ASC
        `;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Student ledger report error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch student ledger',
            error: error.message
        });
    }
};


// ============================================================
// 5. PAYMENT REPORT
// ============================================================
const getPaymentReport = async (req, res) => {
    try {
        const {
            from_date,
            to_date,
            student_id,
            payment_mode
        } = req.query;

        let query = `
            SELECT
                fp.payment_id,
                fp.payment_date,
                fp.receipt_number,

                fp.student_id,
                s.student_code,
                CONCAT_WS(
                    ' ',
                    s.first_name,
                    s.last_name
                ) AS student_name,

                fp.amount,
                fp.payment_mode,
                fp.reference_number,

                COALESCE(
                    SUM(fpa.allocated_amount),
                    0
                )::NUMERIC(12,2) AS allocated_amount,

                fp.remarks

            FROM fee_payments fp

            INNER JOIN students s
                ON s.student_id = fp.student_id

            LEFT JOIN fee_payment_allocations fpa
                ON fpa.payment_id = fp.payment_id

            WHERE 1 = 1
        `;

        const params = [];

        if (from_date) {
            params.push(from_date);
            query += ` AND fp.payment_date >= $${params.length}`;
        }

        if (to_date) {
            params.push(to_date);
            query += ` AND fp.payment_date <= $${params.length}`;
        }

        if (student_id) {
            params.push(student_id);
            query += ` AND fp.student_id = $${params.length}`;
        }

        if (payment_mode) {
            params.push(payment_mode);
            query += ` AND fp.payment_mode = $${params.length}`;
        }

        query += `
            GROUP BY
                fp.payment_id,
                fp.payment_date,
                fp.receipt_number,
                fp.student_id,
                s.student_code,
                s.first_name,
                s.last_name,
                fp.amount,
                fp.payment_mode,
                fp.reference_number,
                fp.remarks

            ORDER BY
                fp.payment_date DESC,
                fp.payment_id DESC
        `;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Payment report error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment report',
            error: error.message
        });
    }
};


module.exports = {
    getOccupancyReport,
    getMonthlyCollectionReport,
    getPendingFeesReport,
    getStudentLedgerReport,
    getPaymentReport
};