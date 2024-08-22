const express = require('express');
const router = express.Router();

const { getIndex } = require('../controlers/index-cont')
const { getLogIn, postLogIn, logOut } = require('../controlers/log-in-cont')
const { postSignUp, getSignUp } = require('../controlers/sign-up-cont')
const { getFolder, postFolder, deleteFolder } = require('../controlers/folder-cont')
const { postFile, getFile, deleteFile } = require('../controlers/file-cont')

router.use((req, res, next) => {
    if (!req.user && req.path !== '/log-in' && req.path !== '/sign-up') {
        res.redirect('/log-in');
    }
    else { next() }
})

router.get('/log-in', getLogIn);
router.get('/sign-up', getSignUp);
router.get('/log-out', logOut);
router.get('/download/file', getFile);

router.post('/log-in', postLogIn);
router.post('/sign-up', postSignUp);
router.post('/files/:folderId', postFile);
router.post('/folders/:folderId', postFolder);

router.get('/delete/file', deleteFile);
router.get('/delete/folder/:folderId', deleteFolder);

router.get(/^\/(?:[a-zA-Z0-9-]+\/)*[a-zA-Z0-9-]*$/, getFolder);



module.exports = router;