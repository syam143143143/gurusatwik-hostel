const express = require('express');

const router = express.Router();

const feesController = require('../controllers/feesController');


// Get all fees
router.get('/', feesController.getFees);


// Get fees of one student
router.get(
    '/student/:studentId',
    feesController.getStudentFees
);


// Get pending amount of student
router.get(
    '/student/:studentId/pending',
    feesController.getStudentPending
);


// Generate monthly fees
router.post(
    '/generate',
    feesController.generateMonthlyFees
);


module.exports = router;