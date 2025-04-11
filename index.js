require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended:true
    })
)
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const { ethers } = require('ethers');
const mongoose = require('mongoose');

var port = 3000;
async function connectToMongoDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the .env file");
        }
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
}

connectToMongoDB();
const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {abi} = require('./artifacts/contracts/Voting.sol/Voting.json');

const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.post("/addCandidate", async (req, res) => {
    var vote = req.body.vote;
    console.log(vote)
    async function storeDataInBlockchain(vote) {
        console.log("Adding the candidate in voting contract...");
        const tx = await contractInstance.addCandidate(vote);
        await tx.wait();
    }
    const bool = await contractInstance.getVotingStatus();
    if (bool == true) {
        await storeDataInBlockchain(vote);
        res.send("The candidate has been registered in the smart contract");
    }
    else {
        res.send("Voting is finished");
    }
});

app.listen(port, function () {
    console.log("App is listening on port 3000")
});