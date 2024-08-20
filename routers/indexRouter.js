const express = require('express');
const router = express.Router();

const { getIndex } = require('../controlers/index-cont')
const { getLogIn, postLogIn, logOut } = require('../controlers/log-in-cont')
const { postSignUp, getSignUp } = require('../controlers/sign-up-cont')
const { getFolder } = require('../controlers/folder-cont')
const { postFile, postFolder } = require('../controlers/post-docs')

router.get('/log-in', getLogIn);
router.get('/sign-up', getSignUp);
router.get('/log-out', logOut);

router.post('/log-in', postLogIn);
router.post('/sign-up', postSignUp);
router.post('/files/:folderId', postFile);
router.post('/folders/:folderId', postFolder);

router.get(/^\/(?:[a-zA-Z0-9-]+\/)*[a-zA-Z0-9-]*$/, getFolder);



module.exports = router;