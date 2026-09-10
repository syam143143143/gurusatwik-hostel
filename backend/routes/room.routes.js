const express = require('express');

const {
    getRooms,
    getRoomById,
    getAvailableBeds,
    getBedsByRoom
} = require('../controllers/room.controller');

const router = express.Router();

router.get('/', getRooms);

router.get('/available-beds', getAvailableBeds);

router.get('/:id', getRoomById);

router.get('/:roomId/beds', getBedsByRoom);

module.exports = router;