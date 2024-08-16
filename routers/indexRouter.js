const express = require('express');
const router = express.Router();

const { getIndex } = require('../controlers/index-cont')
const { getLogIn, postLogIn, logOut } = require('../controlers/log-in-cont')
const { postSignUp, getSignUp } = require('../controlers/sign-up-cont')

router.get('/', getIndex);
router.get('/log-in', getLogIn);
router.get('/sign-up', getSignUp);
router.get('/log-out', logOut);

router.post('/log-in', postLogIn);
router.post('/sign-up', postSignUp);

module.exports = router;