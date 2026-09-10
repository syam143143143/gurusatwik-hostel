const express = require('express');

const router = express.Router();

const paymentsController =
  require('../controllers/paymentsController');


// All payments
router.get(
  '/',
  paymentsController.getPayments
);


// Student payments
router.get(
  '/student/:studentId',
  paymentsController.getStudentPayments
);


// Post payment
router.post(
  '/',
  paymentsController.postPayment
);


// Payment allocation
router.get(
  '/:paymentId/allocations',
  paymentsController.getPaymentAllocations
);


module.exports = router;