require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            socketTimeoutMS: 1200000, // 120 saniye
            serverSelectionTimeoutMS: 600000 // 30 saniye
        });
        console.log('MongoDB bağlantısı başarılı!');
    } catch (error) {
        console.error('MongoDB Veritabanına Bağlanırken Hata Oluştu:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
