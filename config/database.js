const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use Google DNS instead of default resolver
dns.setServers(["8.8.8.8", "8.8.4.4"]);

module.exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
}
