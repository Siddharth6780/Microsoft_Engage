const mongoose = require('mongoose');

const TeamList = new mongoose.Schema({
    team: {
        type: String,
    },
});

module.exports = mongoose.model('TeamList', TeamList);