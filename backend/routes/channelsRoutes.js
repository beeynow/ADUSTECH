const express = require('express');
const auth = require('../middleware/authmiddleware');
const { listChannels, createChannel, getChannel } = require('../controllers/channelsController');

const router = express.Router();

router.get('/channels', auth, listChannels);
router.post('/channels', auth, createChannel);
router.get('/channels/:id', auth, getChannel);

module.exports = router;
