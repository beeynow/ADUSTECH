const express = require('express');
const auth = require('../middleware/authmiddleware');
const { createTimetable, listTimetables, getTimetable } = require('../controllers/timetablesController');

const router = express.Router();

router.get('/timetables', listTimetables);
router.post('/timetables', auth, createTimetable);
router.get('/timetables/:id', getTimetable);

module.exports = router;
