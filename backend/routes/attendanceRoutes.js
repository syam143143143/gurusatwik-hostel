const express = require('express');

const router = express.Router();

const attendanceController =
    require('../controllers/attendanceController');


// All attendance
router.get(
    '/',
    attendanceController.getAttendance
);


// Students for attendance screen
router.get(
    '/students',
    attendanceController.getStudentsForAttendance
);


// Student attendance summary
router.get(
    '/student/:studentId/summary',
    attendanceController.getStudentAttendanceSummary
);


// Mark one student
router.post(
    '/',
    attendanceController.markAttendance
);


// Mark multiple students
router.post(
    '/bulk',
    attendanceController.markBulkAttendance
);


module.exports = router;