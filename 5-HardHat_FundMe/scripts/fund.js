const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")
const { parseEther } = require("ethers")

async function main(params) {
    const { deployer } = await getNamedAccounts()
    const fundMeDeployment = await deployments.get("FundMe")
    const fundMe = await ethers.getContractAt(
        "FundMe",
        fundMeDeployment.address,
    )

    console.log("FundMe contract ...")
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    })
    await transactionResponse.wait(1)
    console.log("Funded successfully!")
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in script:", error)
        process.exit(1)
    })
