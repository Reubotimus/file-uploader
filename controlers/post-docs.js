const prisma = require('../helpers/client');
const multer = require('multer');
const AWS = require('aws-sdk');
const { body, validationResult } = require('express-validator');

async function uploadFolder(req, res, next) {
    console.log(validationResult(req))
    console.log(/[^a-zA-Z0-9-]/.test(req.body.name))
    try {
        if (!validationResult(req).isEmpty()) { throw new Error('invalid folder name') }
        await prisma.folder.create({ data: { name: req.body.name, parentId: Number(req.body.parent), userId: req.user.id } })
    } catch (err) {
        return next(err)
    }
    res.redirect(req.body.path)
}

const upload = multer({ storage: multer.memoryStorage() });
const s3 = new AWS.S3({
    endpoint: 'https://db4a7c641126431f6cd519184dced40a.r2.cloudflarestorage.com',
    region: 'auto',
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    s3ForcePathStyle: true // Necessary for Cloudflare R2
});

async function uploadFile(req, res, next) {
    console.log('Request body:', req.body);
    const file = req.file;

    const params = {
        Bucket: 'file-uploader',
        Key: `${req.user.id}${req.body.path}${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    }
    s3.putObject(params, (err, data) => {
        if (err) {
            return next(err);
        }

    });
    try {
        await prisma.file.create({
            data: {
                folderId: Number(req.body.parent),
                name: file.originalname
            }
        })
    } catch (err) {
        return next(err)
    }
    res.redirect(req.body.path)
}
const postFile = [upload.single('file'), uploadFile]

const postFolder = [body('name').custom(name => {
    if (/[^a-zA-Z0-9-]/.test(name)) {
        throw new Error('invalid characters used')
    }
    return true;
}), body('name').notEmpty(), uploadFolder]
module.exports = { postFile, postFolder }