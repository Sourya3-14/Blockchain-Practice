const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // Sepolia ETH/USD price feed address
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF0d50568e3A7e8259E16663972b11910F89BD8e7", // Polygon ETH/USD price feed address
    },
}

const developmentChains = ["hardhat", "localhost"]
const decimals = "8"
const initialAnswer = "200000000000" // 2000 USD with 8 decimals
module.exports = { networkConfig, developmentChains, decimals, initialAnswer } //exporting the networkConfig and developmentChains objects so that they can be used in other files
