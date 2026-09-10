const pool = require('../config/database');

// =====================================================
// GET ALL ROOMS
// =====================================================
const getRooms = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.room_id,
                r.room_number,
                f.floor_id,
                f.floor_number,
                st.sharing_type_id,
                st.sharing_name,
                r.capacity,
                r.monthly_fee,
                r.room_status,
                r.is_active,

                COUNT(b.bed_id) AS total_beds,

                COUNT(
                    CASE
                        WHEN b.bed_status = 'AVAILABLE'
                        THEN 1
                    END
                ) AS available_beds,

                COUNT(
                    CASE
                        WHEN b.bed_status = 'OCCUPIED'
                        THEN 1
                    END
                ) AS occupied_beds

            FROM rooms r

            INNER JOIN floors f
                ON f.floor_id = r.floor_id

            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id

            LEFT JOIN beds b
                ON b.room_id = r.room_id
               AND b.is_active = TRUE

            WHERE r.is_active = TRUE

            GROUP BY
                r.room_id,
                r.room_number,
                f.floor_id,
                f.floor_number,
                st.sharing_type_id,
                st.sharing_name,
                r.capacity,
                r.monthly_fee,
                r.room_status,
                r.is_active

            ORDER BY
                f.floor_number,
                r.room_number
        `);

        res.status(200).json({
            success: true,
            message: 'Rooms fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Rooms Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch rooms',
            error: error.message
        });
    }
};


// =====================================================
// GET ROOM BY ID
// =====================================================
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const roomResult = await pool.query(`
            SELECT
                r.room_id,
                r.room_number,
                f.floor_id,
                f.floor_number,
                st.sharing_type_id,
                st.sharing_name,
                r.capacity,
                r.monthly_fee,
                r.room_status,
                r.is_active
            FROM rooms r
            INNER JOIN floors f
                ON f.floor_id = r.floor_id
            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id
            WHERE r.room_id = $1
        `, [id]);

        if (roomResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        const bedsResult = await pool.query(`
            SELECT
                b.bed_id,
                b.room_id,
                b.bed_number,
                b.bed_label,
                b.bed_status,
                b.is_active,
                s.student_id,
                s.student_code,
                s.first_name,
                s.last_name
            FROM beds b
            LEFT JOIN room_allocations ra
                ON ra.bed_id = b.bed_id
               AND ra.status = 'ACTIVE'
            LEFT JOIN students s
                ON s.student_id = ra.student_id
            WHERE b.room_id = $1
              AND b.is_active = TRUE
            ORDER BY b.bed_number
        `, [id]);

        res.status(200).json({
            success: true,
            message: 'Room fetched successfully',
            data: {
                room: roomResult.rows[0],
                beds: bedsResult.rows
            }
        });

    } catch (error) {
        console.error('Get Room Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch room',
            error: error.message
        });
    }
};


// =====================================================
// GET ALL AVAILABLE BEDS
// =====================================================
const getAvailableBeds = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.bed_id,
                b.room_id,
                r.room_number,
                f.floor_number,
                b.bed_number,
                b.bed_label,
                b.bed_status,
                st.sharing_name,
                r.capacity,
                r.monthly_fee
            FROM beds b

            INNER JOIN rooms r
                ON r.room_id = b.room_id

            INNER JOIN floors f
                ON f.floor_id = r.floor_id

            INNER JOIN sharing_types st
                ON st.sharing_type_id = r.sharing_type_id

            WHERE b.is_active = TRUE
              AND b.bed_status = 'AVAILABLE'
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
        console.error('Get Available Beds Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch available beds',
            error: error.message
        });
    }
};


// =====================================================
// GET BEDS BY ROOM
// =====================================================
const getBedsByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        const result = await pool.query(`
            SELECT
                b.bed_id,
                b.room_id,
                b.bed_number,
                b.bed_label,
                b.bed_status,
                b.is_active,

                s.student_id,
                s.student_code,
                s.first_name,
                s.last_name

            FROM beds b

            LEFT JOIN room_allocations ra
                ON ra.bed_id = b.bed_id
               AND ra.status = 'ACTIVE'

            LEFT JOIN students s
                ON s.student_id = ra.student_id

            WHERE b.room_id = $1
              AND b.is_active = TRUE

            ORDER BY b.bed_number
        `, [roomId]);

        res.status(200).json({
            success: true,
            message: 'Room beds fetched successfully',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Room Beds Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch room beds',
            error: error.message
        });
    }
};


module.exports = {
    getRooms,
    getRoomById,
    getAvailableBeds,
    getBedsByRoom
};