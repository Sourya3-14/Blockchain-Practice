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

    console.log("FundMe contract withdraw...")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)

    const balance = await ethers.provider.getBalance(fundMe.target)
    assert.equal(balance.toString(), "0")
    console.log("withdrawn successfully!")
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in script:", error)
        process.exit(1)
    })
