// utils/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/nightchat', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useFindAndModify: false, // Bu satırı kaldırın
            // useCreateIndex: true      // Bu satırı kaldırın
        });
        console.log('MongoDB Veritabanına Bağlanıldı');
    } catch (error) {
        console.error('MongoDB Veritabanına Bağlanırken Hata Oluştu:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
