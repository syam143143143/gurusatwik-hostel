const pool = require('../config/database');

const getDashboard = async (req, res) => {
    try {
        const query = `
            SELECT
                total_students,
                total_rooms,
                total_beds,
                occupied_beds,
                available_beds,
                current_month_fee,
                current_month_collection,
                total_pending_fees
            FROM vw_hostel_dashboard
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    total_students: 0,
                    total_rooms: 0,
                    total_beds: 0,
                    occupied_beds: 0,
                    available_beds: 0,
                    current_month_fee: 0,
                    current_month_collection: 0,
                    total_pending_fees: 0
                }
            });
        }

        const dashboard = result.rows[0];

        const data = {
            total_students: Number(dashboard.total_students || 0),
            total_rooms: Number(dashboard.total_rooms || 0),
            total_beds: Number(dashboard.total_beds || 0),
            occupied_beds: Number(dashboard.occupied_beds || 0),
            available_beds: Number(dashboard.available_beds || 0),
            current_month_fee: Number(dashboard.current_month_fee || 0),
            current_month_collection: Number(
                dashboard.current_month_collection || 0
            ),
            total_pending_fees: Number(
                dashboard.total_pending_fees || 0
            )
        };

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Dashboard error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

module.exports = {
    getDashboard
};