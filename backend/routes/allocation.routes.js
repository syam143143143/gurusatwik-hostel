const express = require('express');

const {
    getAllocations,
    getActiveAllocations,
    getAllocationById,
    getAvailableBedsForAllocation,
    createAllocation,
    vacateAllocation
} = require('../controllers/allocation.controller');

const router = express.Router();


// GET ALL ALLOCATIONS
router.get('/', getAllocations);


// GET ACTIVE ALLOCATIONS
router.get('/active', getActiveAllocations);


// GET AVAILABLE BEDS
router.get('/available-beds', getAvailableBedsForAllocation);


// GET ALLOCATION BY ID
router.get('/:id', getAllocationById);


// CREATE ALLOCATION
router.post('/', createAllocation);


// VACATE ALLOCATION
router.put('/:id/vacate', vacateAllocation);


module.exports = router;