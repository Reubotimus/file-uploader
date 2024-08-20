const bcrypt = require("bcryptjs");
const prisma = require('../helpers/client');
const { body, validationResult } = require("express-validator");

async function postEndpoint(req, res, next) {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            // if err, do something
            if (err) { next(err); }
            else {
                try {
                    await prisma.user.create({
                        data:
                        {
                            username: req.body.username,
                            password: hashedPassword,
                            folders: { create: { name: "root", parentId: null } }
                        }
                    })
                    res.redirect('/');
                } catch (err) {
                    next(err)
                }
            }
        });
    } else {
        res.redirect(
            '/sign-up?errors=' + encodeURIComponent(JSON.stringify(errors.array())) +
            '&data=' + encodeURIComponent(JSON.stringify(req.body)));
    }
}

const postSignUp = [
    body('username', 'please enter a username').notEmpty(),
    body('username', 'sorry this username has already been taken')
        .custom(async username => {
            const user = await prisma.user.findUnique({ where: { username: username } });
            if (user == null) {
                return true;
            }
            throw new error('sorry this username has already been taken')
        })
        .withMessage('Sorry, username has already been taken'),
    body('password', 'please enter a password between 5 and 30 characters long')
        .isLength(5, 30),
    body('confirm-password', 'password does not match')
        .custom(async (confirmation, { req }) => {
            if (confirmation !== req.body.password) {
                throw new error('passwords do not match');
            }
            return true;
        })
        .withMessage('passwords do not match'),
    body('secret-code', 'incorrect secret code').equals(process.env.SECRET_CODE),
    postEndpoint
]


function getSignUp(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else if (Object.keys(req.query).length == 0) {
        res.render('sign-up', { errors: [], data: {} })
    } else {
        res.render('sign-up', {
            errors: JSON.parse(decodeURIComponent(req.query.errors)),
            data: JSON.parse(decodeURIComponent(req.query.data))
        });
    }
}

module.exports = { postSignUp, getSignUp }