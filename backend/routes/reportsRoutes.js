const express = require('express');

const {
    getOccupancyReport,
    getMonthlyCollectionReport,
    getPendingFeesReport,
    getStudentLedgerReport,
    getPaymentReport
} = require('../controllers/reportsController');

const router = express.Router();


// ============================================================
// OCCUPANCY
// GET /api/reports/occupancy
// ============================================================
router.get('/occupancy', getOccupancyReport);


// ============================================================
// MONTHLY COLLECTION
// GET /api/reports/monthly-collection
// ============================================================
router.get('/monthly-collection', getMonthlyCollectionReport);


// ============================================================
// PENDING FEES
// GET /api/reports/pending-fees
// ============================================================
router.get('/pending-fees', getPendingFeesReport);


// ============================================================
// STUDENT LEDGER
// GET /api/reports/student-ledger/:studentId
// ============================================================
router.get('/student-ledger/:studentId', getStudentLedgerReport);


// ============================================================
// PAYMENT REPORT
// GET /api/reports/payments
// ============================================================
router.get('/payments', getPaymentReport);


module.exports = router;