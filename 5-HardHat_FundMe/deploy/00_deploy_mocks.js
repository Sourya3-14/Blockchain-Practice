const { network } = require("hardhat") //pulls the network object from hardhat
const {
    developmentChains,
    decimals,
    initialAnswer,
} = require("../helper-hardhat-config") //pulls the developmentChains object from helper-hardhat-config.js

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        //if we are on a local network we want to deploy mocks
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator", //specifying the contract to deploy
            from: deployer,
            log: true,
            args: [decimals, initialAnswer], // 8 decimals and 2000 USD
        })
        log("Mocks deployed!")
        log("___________________________________________")
    }
}

module.exports.tags = ["all", "mocks"] //tags are used to run specific deploy scripts
