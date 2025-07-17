//used for deploying in localhost and hardhat networks
const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { parseEther } = require("ethers")
const { developmentChains } = require("../../helper-hardhat-config")

console.log("Network:", network.name) // add this
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          // const sendValue = "1000000000000000000" // 1 ETH
          const sendValue = parseEther("1") // 1 ETH

          beforeEach(async function () {
              // Get accounts
              deployer = (await getNamedAccounts()).deployer //address of the deployer account

              // Deploy all fixtures with tag "all"
              await deployments.fixture(["all"])

              // Use hre.ethers (the patched version by hardhat-deploy)
              const fundMeDeployment = await deployments.get("FundMe")
              const mockDeployment = await deployments.get("MockV3Aggregator")

              fundMe = await ethers.getContractAt(
                  "FundMe",
                  fundMeDeployment.address,
              )
              mockV3Aggregator = await ethers.getContractAt(
                  "MockV3Aggregator",
                  mockDeployment.address,
              )
          })

          describe("constructor", function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })

          describe("fund", function () {
              it("fails if not enough ETH is sent", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "No minimum amount sent",
                  )
                  //this message has to be exactly same as used in fundme.sol
              })
              it("updates the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunderAmount(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("adds funder to the array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })
          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraws ETH from a single funder", async function () {
                  // Arrange
                  // Assert
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          fundMe.target, //target is the address of the contract
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      endingDeployerBalance + gasCost,
                      startingDeployerBalance + startingFundMeBalance,
                  )
              })
              it("allows us to withdraw with multiple funders", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      //0 is the deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      endingDeployerBalance + gasCost,
                      startingDeployerBalance + startingFundMeBalance,
                  )

                  // Make sure that the funders array is reset
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getFunderAmount(accounts[i].address),
                          0,
                      )
                  }
              })
              it("only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const fundMeConnectedContract = await fundMe.connect(attacker)
                  await expect(
                      fundMeConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__notOwner")
              })
              it("CHeaper withdraw ETH from a single funder", async function () {
                  // Arrange
                  // Assert
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          fundMe.target, //target is the address of the contract
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      endingDeployerBalance + gasCost,
                      startingDeployerBalance + startingFundMeBalance,
                  )
              })

              it("Cheper withdraw with multiple funders", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      //0 is the deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      endingDeployerBalance + gasCost,
                      startingDeployerBalance + startingFundMeBalance,
                  )

                  // Make sure that the funders array is reset
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getFunderAmount(accounts[i].address),
                          0,
                      )
                  }
              })
          })
      })
