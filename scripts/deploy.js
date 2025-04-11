const hre = require("hardhat");

async function main() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const Voting_ = await Voting.deploy(["Mark", "Mike", "George"], 60);


    console.log(
        `Contract Address : ${await Voting_.getAddress()}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});