module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("Deploying PriceConvertor library...")
    await deploy("PriceConvertor", {
        from: deployer,
        log: true,
    })
    log("PriceConvertor library deployed!")
    log("___________________________________________")
}

module.exports.tags = ["library", "all"]
