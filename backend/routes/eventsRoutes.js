const express = require('express');
const auth = require('../middleware/authmiddleware');
const { createEvent, listEvents, getEvent } = require('../controllers/eventsController');

const router = express.Router();

router.get('/events', listEvents);
router.post('/events', auth, createEvent);
router.get('/events/:id', getEvent);

module.exports = router;
