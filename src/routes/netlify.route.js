const netlify = require('../controllers/netlify.controller');

module.exports = (app) => {
    app.post('/api/notify/netlify/:token', netlify.notify)
}