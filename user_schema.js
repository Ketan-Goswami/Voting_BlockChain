const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    voter_Name: {
        type: String,
        required: true,
    },
    adhar_Number: {
        type: String,
        required: true,
        match: [/^\d{4} \d{4} \d{4} \d{4}$/, 'Aadhaar number must be 16 digits with spaces after every 4 digits (e.g., "1234 5678 9012 3456")'],
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
