module.exports = {
    'secret': 'robotmonkeylaserexplosion',
    database: process.env.MONGODB_URI || 'mongodb://127.0.0.1/timetables',
    port: process.env.PORT || 3030, // used to create, sign, and verify tokens
};
