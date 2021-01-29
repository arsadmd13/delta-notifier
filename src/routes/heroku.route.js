const heroku = require('../controllers/heroku.controller');

module.exports = (app) => {
    app.post('/api/notify/heroku/:token', heroku.notify)
}