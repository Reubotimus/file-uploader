function getIndex(req, res) {
    if (!req.user) { res.redirect('/log-in') }
    else { res.render('index') }
}

module.exports = { getIndex };