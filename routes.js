const express = require('express');
const { User, Driver, Ride } = require('./models');
const router = express.Router();
const mongoose = require("mongoose");


router.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});


router.get('/drivers', async (req, res) => {
    const drivers = await Driver.find();
    res.json(drivers);
});


router.get('/calculate-fare', (req, res) => {
    const distance = 25;
    const baseFare = 50;
    const perKmRate = 10;
    const totalFare = baseFare + (perKmRate * distance);
    res.json({ fare: totalFare });
});


router.post('/request-ride', async (req, res) => {
    try {
        console.log("Incoming Ride Request:", req.body);

        const { userId, pickup, destination } = req.body;
        if (!userId || !pickup || !destination) {
            return res.status(400).json({ message: "Missing required fields" });
        }

   
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const driver = await Driver.findOne({ status: "available" });
        if (!driver) {
            return res.status(400).json({ message: "No drivers available" });
        }

        const fare = 50 + (10 * 25);
        const ride = await Ride.create({ 
            userId: userObjectId, 
            driverId: driver._id, 
            pickup, 
            destination, 
            fare 
        });

        await Driver.updateOne({ _id: driver._id }, { status: "on-trip" });

        res.json({ message: "Ride Requested", ride });
    } catch (error) {
        console.error("Error in /request-ride:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


router.post('/accept-ride', async (req, res) => {
    const { rideId, driverId } = req.body;

    await Ride.updateOne({ _id: rideId }, { status: "accepted", driverId });
    await Driver.updateOne({ _id: driverId }, { status: "on-trip" });

    res.json({ message: "Ride Accepted" });
});


router.post('/complete-ride', async (req, res) => {
    const { rideId, driverId } = req.body;

    await Ride.updateOne({ _id: rideId }, { status: "completed" });
    await Driver.updateOne({ _id: driverId }, { status: "available" });

    res.json({ message: "Ride Completed" });
});

router.post('/users', async (req, res) => {
    try {
        const { name, email, phone, location, destination } = req.body;

        if (!name || !email || !phone || !location || !destination) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newUser = await User.create({ name, email, phone, location, destination });
        res.status(201).json({ message: "User added successfully", user: newUser });

    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



router.post('/drivers', async (req, res) => {
    const { name, phone, vehicle } = req.body;
    
    if (!name || !phone || !vehicle) {
        return res.status(400).json({ message: "Name, phone, and vehicle are required" });
    }

    try {
        const newDriver = await Driver.create({ name, phone, vehicle, status: "available" });
        res.status(201).json({ message: "Driver added successfully", driver: newDriver });
    } catch (error) {
        res.status(500).json({ message: "Error adding driver", error });
    }
});


module.exports = router;
