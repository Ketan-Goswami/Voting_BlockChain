require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const { ethers } = require('ethers');
const mongoose = require('mongoose');
const votingArtifact = require('./artifacts/contracts/Voting.sol/Voting.json');

const app = express();
app.use(fileUpload({ extended: true }));
app.use(express.static(__dirname));
app.use(express.json());

const port = 3000;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_URL = process.env.API_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function connectToMongoDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) throw new Error("MONGO_URI is not defined in the .env file");
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}

connectToMongoDB();

const provider = new ethers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, votingArtifact.abi, signer);

app.get(["/", "/index.html"], (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/addCandidate", async (req, res) => {
    const vote = req.body.vote;
    console.log("Received vote:", vote);

    try {
        const votingOpen = await contractInstance.getVotingStatus();
        if (votingOpen) {
            const tx = await contractInstance.addCandidate(vote);
            await tx.wait();
            res.send("The candidate has been registered in the smart contract");
        } else {
            res.send("Voting is finished");
        }
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Error while interacting with smart contract");
    }
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
