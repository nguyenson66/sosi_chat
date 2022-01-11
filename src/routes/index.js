const admin = require('./admin')
const client = require('./client')

function routes(app) {
    app.use('/', client)
    app.use('/admin', admin)
}

module.exports = routes