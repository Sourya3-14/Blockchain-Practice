const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")

async function main() {
    const { deployer } = await getNamedAccounts()

    const fundMeDeployment = await deployments.get("FundMe")
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)

    const fundMeAddress = await fundMe.getAddress()
    const contractBalance = await ethers.provider.getBalance(fundMeAddress)

    console.log(`FundMe Address: ${fundMeAddress}`)
    console.log(`Contract Balance: ${ethers.formatEther(contractBalance)} ETH`)

    const owner = await fundMe.getOwner()
    console.log(`Contract Owner: ${owner}`)
    console.log(`You (deployer): ${deployer}`)

    if (deployer !== owner) {
        console.log("You are not the contract owner. Cannot withdraw.")
        return
    }

    if (contractBalance > 0) {
        console.log("Withdrawing funds...")
        const txResponse = await fundMe.cheaperWithdraw()
        await txResponse.wait()
        const balance = await ethers.provider.getBalance(fundMe.target)
        assert.equal(balance.toString(), "0")

        console.log("Funds withdrawn successfully.")
    } else {
        console.log("ℹContract balance is 0. Nothing to withdraw.")
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error resetting contract:", error)
        process.exit(1)
    })
