const prisma = require('../helpers/client');
const multer = require('multer');
const AWS = require('aws-sdk');
const { body, validationResult } = require('express-validator');



const upload = multer({ storage: multer.memoryStorage() });
const s3 = new AWS.S3({
    endpoint: 'https://db4a7c641126431f6cd519184dced40a.r2.cloudflarestorage.com',
    region: 'auto',
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    s3ForcePathStyle: true // Necessary for Cloudflare R2
});

async function uploadFiles(req, res, next) {
    console.log('Request body:', req.body);
    const files = req.files; // use `req.files` for multiple files

    try {
        for (const file of files) {
            const params = {
                Bucket: 'file-uploader',
                Key: `${req.user.id}${req.body.path}${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype
            };

            // Upload each file to S3
            await s3.putObject(params).promise();

            // Create a database record for each file
            await prisma.file.create({
                data: {
                    folderId: Number(req.body.parent),
                    name: file.originalname,
                    userId: req.user.id
                }
            });
        }
    } catch (err) {
        return next(err);
    }
    res.redirect(req.body.path);
}

const postFile = [upload.array('file', 10), uploadFiles];

async function getFile(req, res, next) {
    console.log(req.query);
    let file = undefined;
    try {
        file = await prisma.file.findUnique({ where: 
            { name_folderId_userId: {
                name: req.query.filename, 
                folderId: Number(req.query.folder), 
                userId: req.user.id 
            }} 
        });
    } catch (err) {
        return next(err);
    }
    let key = req.query.path === '/' ? `${file.userId}/${file.name}` : `${file.userId}${req.query.path}${file.name}`
    console.log(key)

    const params = {
        Bucket: 'file-uploader',
        Key: key
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            return next(err);
        }

        // Set headers for download
        res.setHeader('Content-Disposition', 'attachment; filename=' + file.name);
        res.setHeader('Content-Type', data.ContentType);

        res.send(data.Body);
    });
}



module.exports = { postFile, getFile }