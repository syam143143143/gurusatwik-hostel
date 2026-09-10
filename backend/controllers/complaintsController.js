const pool = require('../config/database');

// ============================================================
// GET ALL COMPLAINTS
// GET /api/complaints
// ============================================================
const getAllComplaints = async (req, res) => {
    try {
        const query = `
            SELECT
                c.complaint_id,
                c.student_id,
                s.student_code,
                CONCAT_WS(' ', s.first_name, s.last_name) AS student_name,
                c.complaint_type,
                c.description,
                c.priority,
                c.status,
                c.complaint_date,
                c.resolved_date,
                c.resolution_notes,
                c.created_at
            FROM complaints c
            INNER JOIN students s
                ON s.student_id = c.student_id
            ORDER BY c.complaint_date DESC, c.complaint_id DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get complaints error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
};


// ============================================================
// GET COMPLAINT BY ID
// GET /api/complaints/:id
// ============================================================
const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT
                c.complaint_id,
                c.student_id,
                s.student_code,
                CONCAT_WS(' ', s.first_name, s.last_name) AS student_name,
                s.mobile_number,
                c.complaint_type,
                c.description,
                c.priority,
                c.status,
                c.complaint_date,
                c.resolved_date,
                c.resolution_notes,
                c.created_at
            FROM complaints c
            INNER JOIN students s
                ON s.student_id = c.student_id
            WHERE c.complaint_id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get complaint error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint',
            error: error.message
        });
    }
};


// ============================================================
// GET COMPLAINTS BY STUDENT
// GET /api/complaints/student/:studentId
// ============================================================
const getComplaintsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const query = `
            SELECT
                c.complaint_id,
                c.student_id,
                s.student_code,
                CONCAT_WS(' ', s.first_name, s.last_name) AS student_name,
                c.complaint_type,
                c.description,
                c.priority,
                c.status,
                c.complaint_date,
                c.resolved_date,
                c.resolution_notes,
                c.created_at
            FROM complaints c
            INNER JOIN students s
                ON s.student_id = c.student_id
            WHERE c.student_id = $1
            ORDER BY c.complaint_date DESC, c.complaint_id DESC
        `;

        const result = await pool.query(query, [studentId]);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get student complaints error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch student complaints',
            error: error.message
        });
    }
};


// ============================================================
// GET OPEN COMPLAINTS
// GET /api/complaints/open
// ============================================================
const getOpenComplaints = async (req, res) => {
    try {
        const query = `
            SELECT
                c.complaint_id,
                c.student_id,
                s.student_code,
                CONCAT_WS(' ', s.first_name, s.last_name) AS student_name,
                c.complaint_type,
                c.description,
                c.priority,
                c.status,
                c.complaint_date,
                c.resolved_date,
                c.resolution_notes
            FROM complaints c
            INNER JOIN students s
                ON s.student_id = c.student_id
            WHERE c.status IN ('OPEN', 'IN_PROGRESS')
            ORDER BY
                CASE c.priority
                    WHEN 'URGENT' THEN 1
                    WHEN 'HIGH' THEN 2
                    WHEN 'MEDIUM' THEN 3
                    WHEN 'LOW' THEN 4
                END,
                c.complaint_date ASC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error('Get open complaints error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch open complaints',
            error: error.message
        });
    }
};


// ============================================================
// CREATE COMPLAINT
// POST /api/complaints
// ============================================================
const createComplaint = async (req, res) => {
    try {
        const {
            student_id,
            complaint_type,
            description,
            priority,
            complaint_date
        } = req.body;

        if (!student_id) {
            return res.status(400).json({
                success: false,
                message: 'student_id is required'
            });
        }

        if (!complaint_type) {
            return res.status(400).json({
                success: false,
                message: 'complaint_type is required'
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'description is required'
            });
        }

        const studentCheck = await pool.query(
            `
            SELECT student_id, student_code
            FROM students
            WHERE student_id = $1
            `,
            [student_id]
        );

        if (studentCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const query = `
            INSERT INTO complaints (
                student_id,
                complaint_type,
                description,
                priority,
                complaint_date
            )
            VALUES ($1, $2, $3, COALESCE($4, 'MEDIUM'), COALESCE($5, CURRENT_DATE))
            RETURNING
                complaint_id,
                student_id,
                complaint_type,
                description,
                priority,
                status,
                complaint_date,
                resolved_date,
                resolution_notes,
                created_at
        `;

        const result = await pool.query(query, [
            student_id,
            complaint_type,
            description,
            priority || null,
            complaint_date || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Complaint created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Create complaint error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to create complaint',
            error: error.message
        });
    }
};


// ============================================================
// UPDATE COMPLAINT
// PUT /api/complaints/:id
// ============================================================
const updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            complaint_type,
            description,
            priority,
            status,
            resolution_notes
        } = req.body;

        const existing = await pool.query(
            `
            SELECT complaint_id
            FROM complaints
            WHERE complaint_id = $1
            `,
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        const query = `
            UPDATE complaints
            SET
                complaint_type = COALESCE($1, complaint_type),
                description = COALESCE($2, description),
                priority = COALESCE($3, priority),
                status = COALESCE($4, status),
                resolution_notes = COALESCE($5, resolution_notes),
                resolved_date =
                    CASE
                        WHEN $4 = 'RESOLVED'
                             AND resolved_date IS NULL
                        THEN CURRENT_DATE

                        WHEN $4 = 'CLOSED'
                             AND resolved_date IS NULL
                        THEN CURRENT_DATE

                        WHEN $4 IS NOT NULL
                             AND $4 NOT IN ('RESOLVED', 'CLOSED')
                        THEN NULL

                        ELSE resolved_date
                    END
            WHERE complaint_id = $6
            RETURNING
                complaint_id,
                student_id,
                complaint_type,
                description,
                priority,
                status,
                complaint_date,
                resolved_date,
                resolution_notes,
                created_at
        `;

        const result = await pool.query(query, [
            complaint_type || null,
            description || null,
            priority || null,
            status || null,
            resolution_notes || null,
            id
        ]);

        res.status(200).json({
            success: true,
            message: 'Complaint updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update complaint error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update complaint',
            error: error.message
        });
    }
};


// ============================================================
// UPDATE COMPLAINT STATUS
// PATCH /api/complaints/:id/status
// ============================================================
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution_notes } = req.body;

        const allowedStatuses = [
            'OPEN',
            'IN_PROGRESS',
            'RESOLVED',
            'CLOSED'
        ];

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'status is required'
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
            });
        }

        const query = `
            UPDATE complaints
            SET
                status = $1,
                resolution_notes =
                    CASE
                        WHEN $2 IS NOT NULL THEN $2
                        ELSE resolution_notes
                    END,
                resolved_date =
                    CASE
                        WHEN $1 IN ('RESOLVED', 'CLOSED')
                        THEN CURRENT_DATE
                        ELSE NULL
                    END
            WHERE complaint_id = $3
            RETURNING
                complaint_id,
                student_id,
                complaint_type,
                description,
                priority,
                status,
                complaint_date,
                resolved_date,
                resolution_notes,
                created_at
        `;

        const result = await pool.query(query, [
            status,
            resolution_notes || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Complaint status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update complaint status error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update complaint status',
            error: error.message
        });
    }
};


// ============================================================
// DELETE / CLOSE COMPLAINT
// DELETE /api/complaints/:id
// ============================================================
const deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE complaints
            SET
                status = 'CLOSED',
                resolved_date = COALESCE(resolved_date, CURRENT_DATE)
            WHERE complaint_id = $1
            RETURNING complaint_id, status, resolved_date
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Complaint closed successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Close complaint error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to close complaint',
            error: error.message
        });
    }
};


module.exports = {
    getAllComplaints,
    getComplaintById,
    getComplaintsByStudent,
    getOpenComplaints,
    createComplaint,
    updateComplaint,
    updateComplaintStatus,
    deleteComplaint
};