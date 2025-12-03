const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vaultdb';

// Define Record schema for MongoDB
const recordSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    value: String,
    createdAt: { type: Date, default: Date.now }
});

const MongoRecord = mongoose.model('Record', recordSchema);

// Connect to MongoDB
let isConnected = false;

async function connectMongoDB() {
    if (isConnected) return;
    
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        isConnected = true;
        console.log('[MongoDB] Connected successfully');
    } catch (error) {
        console.log('[MongoDB] Connection failed, using file storage:', error.message);
    }
}

async function saveToMongo(record) {
    try {
        await connectMongoDB();
        const mongoRecord = new MongoRecord(record);
        await mongoRecord.save();
        return true;
    } catch (error) {
        return false;
    }
}

async function getAllFromMongo() {
    try {
        await connectMongoDB();
        return await MongoRecord.find().sort({ id: 1 });
    } catch (error) {
        return [];
    }
}

async function updateInMongo(id, newName, newValue) {
    try {
        await connectMongoDB();
        const result = await MongoRecord.findOneAndUpdate(
            { id: id },
            { name: newName, value: newValue },
            { new: true }
        );
        return result;
    } catch (error) {
        return null;
    }
}

async function deleteFromMongo(id) {
    try {
        await connectMongoDB();
        const result = await MongoRecord.findOneAndDelete({ id: id });
        return result;
    } catch (error) {
        return null;
    }
}

async function searchInMongo(keyword) {
    try {
        await connectMongoDB();
        return await MongoRecord.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { value: { $regex: keyword, $options: 'i' } },
                { id: { $regex: keyword } }
            ]
        });
    } catch (error) {
        return [];
    }
}

module.exports = {
    saveToMongo,
    getAllFromMongo,
    updateInMongo,
    deleteFromMongo,
    searchInMongo,
    MongoRecord
};
