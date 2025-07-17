const { expect, assert } = require("chai")
const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { parseEther } = require("ethers")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe (Staging Test)", function () {
          let fundMe
          let deployer
          const sendValue = parseEther("0.001")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              const fundMeDeployment = await deployments.get("FundMe")
              fundMe = await ethers.getContractAt(
                  "FundMe",
                  fundMeDeployment.address,
              )
          })

          describe("constructor", function () {
              it("sets the price feed address correctly", async function () {
                  const priceFeed = await fundMe.getPriceFeed()
                  assert.equal(
                      priceFeed,
                      networkConfig[network.config.chainId].ethUsdPriceFeed,
                  )
              })
          })

          describe("fund", function () {
              it("fails if not enough ETH is sent", async function () {
                  await expect(fundMe.fund({})).to.be.revertedWith(
                      "No minimum amount sent",
                  )
              })

              it("records the amount funded", async function () {
                  const usdValue = await fundMe.getDebugConversion(sendValue)
                  console.log("USD Value of sendValue:", usdValue.toString())

                  const tx = await fundMe.fund({ value: sendValue })
                  await tx.wait()

                  const response = await fundMe.getFunderAmount(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("adds funder to funders list", async function () {
                  const usdValue = await fundMe.getDebugConversion(sendValue)
                  console.log("USD Value of sendValue:", usdValue.toString())
                  const tx = await fundMe.fund({ value: sendValue })
                  await tx.wait()
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", function () {
              it("allows the owner to withdraw", async function () {
                  await fundMe.fund({ value: sendValue })

                  console.log(deployer, "deployer address")
                  const owner = await fundMe.getOwner()
                  console.log(owner, "owner address")
                  assert.equal(owner, deployer)

                  const tx = await fundMe.cheaperWithdraw({ gasLimit: 1000000 })
                  await tx.wait()
                  const balance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  assert.equal(balance.toString(), "0")
              })
          })
      })
