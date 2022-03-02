const admin = require('./admin');
const client = require('./client');
const path = require('path');

function routes(app) {
    app.use('/', client);
    app.use('/admin', admin);

    app.use(function (req, res, next) {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            res.sendFile(path.join(__dirname, '../views/404.html'));
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.json({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    });
}

module.exports = routes;
