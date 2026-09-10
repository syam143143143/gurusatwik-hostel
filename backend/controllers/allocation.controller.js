const pool = require('../config/database');


// =====================================================
// GET ALL ALLOCATIONS
// =====================================================
const getAllocations = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                ra.allocation_id,

                ra.student_id,
                s.student_code,
                s.first_name,
                s.last_name,
                s.mobile_number,

                ra.bed_id,
                b.bed_number,
                b.bed_label,
                b.bed_status,

                r.room_id,
                r.room_number,

                f.floor_id,
                f.floor_number,

                st.sharing_type_id,
                st.sharing_name,

                ra.allocation_date,
                ra.vacated_date,
                ra.monthly_fee,
                ra.status,
                ra.remarks,
                ra.created_at

            FROM room_allocations ra

            INNER JOIN students s
                ON s.student_id = ra.student_id

            INNER JOIN beds b
                ON b.bed_id = ra.bed_id

            INNER JOIN rooms r
                ON r.room_id = b.room_id

            INNER JOIN floors f
                ON f.floor_id = r.floor_id

            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id

            ORDER BY
                ra.allocation_id DESC
        `);

        res.status(200).json({
            success: true,
            message: 'Allocations fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Allocations Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch allocations',
            error: error.message
        });
    }
};


// =====================================================
// GET ACTIVE ALLOCATIONS
// =====================================================
const getActiveAllocations = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                ra.allocation_id,

                ra.student_id,
                s.student_code,
                s.first_name,
                s.last_name,
                s.mobile_number,

                ra.bed_id,
                b.bed_number,
                b.bed_label,

                r.room_id,
                r.room_number,

                f.floor_id,
                f.floor_number,

                st.sharing_type_id,
                st.sharing_name,

                ra.allocation_date,
                ra.monthly_fee,
                ra.status,
                ra.remarks

            FROM room_allocations ra

            INNER JOIN students s
                ON s.student_id = ra.student_id

            INNER JOIN beds b
                ON b.bed_id = ra.bed_id

            INNER JOIN rooms r
                ON r.room_id = b.room_id

            INNER JOIN floors f
                ON f.floor_id = r.floor_id

            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id

            WHERE ra.status = 'ACTIVE'

            ORDER BY
                f.floor_number,
                r.room_number,
                b.bed_number
        `);

        res.status(200).json({
            success: true,
            message: 'Active allocations fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Active Allocations Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch active allocations',
            error: error.message
        });
    }
};


// =====================================================
// GET ALLOCATION BY ID
// =====================================================
const getAllocationById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                ra.allocation_id,

                ra.student_id,
                s.student_code,
                s.first_name,
                s.last_name,
                s.mobile_number,

                ra.bed_id,
                b.bed_number,
                b.bed_label,
                b.bed_status,

                r.room_id,
                r.room_number,
                r.capacity,
                r.monthly_fee AS room_monthly_fee,

                f.floor_id,
                f.floor_number,

                st.sharing_type_id,
                st.sharing_name,

                ra.allocation_date,
                ra.vacated_date,
                ra.monthly_fee,
                ra.status,
                ra.remarks,
                ra.created_at

            FROM room_allocations ra

            INNER JOIN students s
                ON s.student_id = ra.student_id

            INNER JOIN beds b
                ON b.bed_id = ra.bed_id

            INNER JOIN rooms r
                ON r.room_id = b.room_id

            INNER JOIN floors f
                ON f.floor_id = r.floor_id

            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id

            WHERE ra.allocation_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Allocation fetched successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Allocation Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch allocation',
            error: error.message
        });
    }
};


// =====================================================
// GET AVAILABLE BEDS FOR ALLOCATION
// =====================================================
const getAvailableBedsForAllocation = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.bed_id,
                b.bed_number,
                b.bed_label,

                r.room_id,
                r.room_number,
                r.capacity,
                r.monthly_fee,

                f.floor_id,
                f.floor_number,

                st.sharing_type_id,
                st.sharing_name

            FROM beds b

            INNER JOIN rooms r
                ON r.room_id = b.room_id

            INNER JOIN floors f
                ON f.floor_id = r.floor_id

            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id

            WHERE b.bed_status = 'AVAILABLE'
              AND b.is_active = TRUE
              AND r.is_active = TRUE

            ORDER BY
                f.floor_number,
                r.room_number,
                b.bed_number
        `);

        res.status(200).json({
            success: true,
            message: 'Available beds fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Available Beds Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch available beds',
            error: error.message
        });
    }
};


// =====================================================
// CREATE ALLOCATION
// =====================================================
const createAllocation = async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            student_id,
            bed_id,
            allocation_date,
            remarks
        } = req.body;

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------
        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'student_id is required'
            });
        }

        if (!bed_id) {
            return res.status(400).json({
                success: false,
                message: 'bed_id is required'
            });
        }

        await client.query('BEGIN');


        // ---------------------------------------------
        // CHECK STUDENT
        // ---------------------------------------------
        const studentResult = await client.query(`
            SELECT
                student_id,
                student_code,
                first_name,
                last_name,
                status
            FROM students
            WHERE student_id = $1
            FOR UPDATE
        `, [student_id]);

        if (studentResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = studentResult.rows[0];

        if (student.status !== 'ACTIVE') {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Student is not active'
            });
        }


        // ---------------------------------------------
        // CHECK EXISTING ACTIVE ALLOCATION
        // ---------------------------------------------
        const existingAllocation = await client.query(`
            SELECT
                allocation_id,
                bed_id
            FROM room_allocations
            WHERE student_id = $1
              AND status = 'ACTIVE'
            FOR UPDATE
        `, [student_id]);

        if (existingAllocation.rows.length > 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Student already has an active room allocation',
                allocation_id: existingAllocation.rows[0].allocation_id
            });
        }


        // ---------------------------------------------
        // CHECK BED
        // ---------------------------------------------
        const bedResult = await client.query(`
            SELECT
                b.bed_id,
                b.room_id,
                b.bed_number,
                b.bed_label,
                b.bed_status,

                r.room_number,
                r.capacity,
                r.monthly_fee,
                r.room_status,

                f.floor_number,

                st.sharing_name

            FROM beds b

            INNER JOIN rooms r
                ON r.room_id = b.room_id

            INNER JOIN floors f
                ON f.floor_id = r.floor_id

            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id

            WHERE b.bed_id = $1
              AND b.is_active = TRUE
              AND r.is_active = TRUE

            FOR UPDATE
        `, [bed_id]);

        if (bedResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Bed not found'
            });
        }

        const bed = bedResult.rows[0];


        // ---------------------------------------------
        // CHECK BED AVAILABLE
        // ---------------------------------------------
        if (bed.bed_status !== 'AVAILABLE') {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Selected bed is not available',
                bed_id: bed_id,
                bed_status: bed.bed_status
            });
        }


        // ---------------------------------------------
        // CREATE ALLOCATION
        // ---------------------------------------------
        const allocationResult = await client.query(`
            INSERT INTO room_allocations (
                student_id,
                bed_id,
                allocation_date,
                monthly_fee,
                status,
                remarks
            )
            VALUES (
                $1,
                $2,
                COALESCE($3::DATE, CURRENT_DATE),
                $4,
                'ACTIVE',
                $5
            )
            RETURNING *
        `, [
            student_id,
            bed_id,
            allocation_date || null,
            bed.monthly_fee,
            remarks || null
        ]);

        const allocation = allocationResult.rows[0];


        // ---------------------------------------------
        // UPDATE BED STATUS
        // ---------------------------------------------
        await client.query(`
            UPDATE beds
            SET bed_status = 'OCCUPIED'
            WHERE bed_id = $1
        `, [bed_id]);


        // ---------------------------------------------
        // UPDATE ROOM STATUS
        // ---------------------------------------------
        await client.query(`
            SELECT update_room_status($1)
        `, [bed.room_id]);


        await client.query('COMMIT');


        res.status(201).json({
            success: true,
            message: 'Student allocated successfully',
            data: {
                allocation_id: allocation.allocation_id,
                student_id: student.student_id,
                student_code: student.student_code,
                student_name:
                    `${student.first_name} ${student.last_name || ''}`.trim(),

                bed_id: bed.bed_id,
                bed_number: bed.bed_number,
                bed_label: bed.bed_label,

                room_id: bed.room_id,
                room_number: bed.room_number,
                floor_number: bed.floor_number,

                sharing_name: bed.sharing_name,
                monthly_fee: bed.monthly_fee,

                allocation_date: allocation.allocation_date,
                status: allocation.status
            }
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Create Allocation Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create allocation',
            error: error.message
        });

    } finally {
        client.release();
    }
};


// =====================================================
// VACATE / DELETE ALLOCATION
// =====================================================
const vacateAllocation = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query('BEGIN');


        // ---------------------------------------------
        // GET ALLOCATION
        // ---------------------------------------------
        const allocationResult = await client.query(`
            SELECT
                ra.allocation_id,
                ra.student_id,
                ra.bed_id,
                ra.status,
                b.room_id

            FROM room_allocations ra

            INNER JOIN beds b
                ON b.bed_id = ra.bed_id

            WHERE ra.allocation_id = $1

            FOR UPDATE
        `, [id]);


        if (allocationResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        const allocation = allocationResult.rows[0];


        if (allocation.status !== 'ACTIVE') {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Allocation is already inactive'
            });
        }


        // ---------------------------------------------
        // UPDATE ALLOCATION
        // ---------------------------------------------
        await client.query(`
            UPDATE room_allocations
            SET
                status = 'VACATED',
                vacated_date = CURRENT_DATE
            WHERE allocation_id = $1
        `, [id]);


        // ---------------------------------------------
        // FREE BED
        // ---------------------------------------------
        await client.query(`
            UPDATE beds
            SET bed_status = 'AVAILABLE'
            WHERE bed_id = $1
        `, [allocation.bed_id]);


        // ---------------------------------------------
        // UPDATE ROOM STATUS
        // ---------------------------------------------
        await client.query(`
            SELECT update_room_status($1)
        `, [allocation.room_id]);


        await client.query('COMMIT');


        res.status(200).json({
            success: true,
            message: 'Student vacated successfully',
            data: {
                allocation_id: allocation.allocation_id,
                student_id: allocation.student_id,
                bed_id: allocation.bed_id,
                status: 'VACATED'
            }
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Vacate Allocation Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to vacate allocation',
            error: error.message
        });

    } finally {
        client.release();
    }
};


module.exports = {
    getAllocations,
    getActiveAllocations,
    getAllocationById,
    getAvailableBedsForAllocation,
    createAllocation,
    vacateAllocation
};