const express = require('express');

const {
    getAllComplaints,
    getComplaintById,
    getComplaintsByStudent,
    getOpenComplaints,
    createComplaint,
    updateComplaint,
    updateComplaintStatus,
    deleteComplaint
} = require('../controllers/complaintsController');

const router = express.Router();


// GET all complaints
router.get('/', getAllComplaints);


// GET open / in-progress complaints
router.get('/open', getOpenComplaints);


// GET complaints for one student
router.get('/student/:studentId', getComplaintsByStudent);


// GET complaint by ID
router.get('/:id', getComplaintById);


// CREATE complaint
router.post('/', createComplaint);


// UPDATE complaint
router.put('/:id', updateComplaint);


// UPDATE only complaint status
router.patch('/:id/status', updateComplaintStatus);


// CLOSE complaint
router.delete('/:id', deleteComplaint);


module.exports = router;