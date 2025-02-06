const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    location: String,
    destination: String
});


const DriverSchema = new mongoose.Schema({
    name: String,
    phone: String,
    status: { type: String, default: "available" },
    vehicle: String
});

const RideSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    driverId: mongoose.Schema.Types.ObjectId,
    pickup: String,
    destination: String,
    fare: Number,
    status: { type: String, default: "pending" }
});

const User = mongoose.model("User", UserSchema);
const Driver = mongoose.model("Driver", DriverSchema);
const Ride = mongoose.model("Ride", RideSchema);

module.exports = { User, Driver, Ride };
