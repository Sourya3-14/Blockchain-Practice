require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomicfoundation/hardhat-verify")
require("hardhat-gas-reporter")
require("hardhat-deploy")

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "http://sepolia/YOUR_INFURA_PROJECT_ID"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xYOUR_PRIVATE_KEY"
const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || "YOUR_ETHERSCAN_API_KEY"
const COINMARKETCAP_API_KEY =
    process.env.COINMARKETCAP_API_KEY || "YOUR_COINMARKETCAP_API_KEY"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [{ version: "0.8.24" }, { version: "0.6.6" }],
    },
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6, // Number of block confirmations to wait before considering the transaction confirmed
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
        etherscan: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here 0 is the first account in the list of accounts
        },
        user: {
            default: 1, // here 1 is the second account in the list of accounts
        },
    },
}
