//import
//main
//calling main function
//this is the normal structure of a deploy script
//but now it will be a bit different

// function deployFunc(hre) {
//   console.log("Hi, I am a deploy script");
// }
// module.exports.default = deployFunc;

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config.js") //pulls just the networkConfig object from the helper-hardhat-config.js file
const { network } = require("hardhat") //pulls the network object from hardhat
const { verifyContract } = require("../utils/verify.js") // Importing the verify function from utils/verify.js
require("dotenv").config() //loads environment variables from a .env file into process.env

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //when going for a localshost or hardhat network we want to use a mock
    //what happens when we want to change the chain?
    //for aggregatorv3interface we  have to change the address for each change in chain
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        log("Using MockV3Aggregator at address:", ethUsdPriceFeedAddress)
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
        log("Using real price feed at address:", ethUsdPriceFeedAddress)
    }

    const args = [ethUsdPriceFeedAddress] //args for the constructor of the contract
    const fundMe = await deploy("FundMe", {
        contract: "FundMe", //specifying the contract to deploy
        from: deployer,
        log: true,
        args: args, //address of the price feed contract
        waitConfirmations: network.config.blockConfirmations || 1, //wait for the specified number of block confirmations
        //if blockConfirmations is not specified in the network config, default to 1

        libraries: {
            PriceConvertor: (await deployments.get("PriceConvertor")).address,
        },
    })
    log("FundMe deployed ")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verifyContract(fundMe.address, args)
    }
    log("-----------------------------------------")
}

module.exports.tags = ["all", "fundme"] //tags are used to run specific deploy scripts
//this will run all deploy scripts with the tag "all" and "fundme"
