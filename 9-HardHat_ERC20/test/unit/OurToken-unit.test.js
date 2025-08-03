const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("OurToken Unit Test", function () {
      //Multipler is used to make reading the math easier because of the 18 decimal points
      const multiplier = 10 ** 18;
      let ourToken, deployer, user1;
      beforeEach(async function () {
        // Fix: Get accounts using ethers.getSigners() instead of getNamedAccounts()
        const accounts = await ethers.getSigners();
        deployer = accounts[0].address;
        user1 = accounts[1].address;

        await deployments.fixture("all");
        const ourTokenDeployment = await deployments.get("OurToken");
        ourToken = await ethers.getContractAt(
          "OurToken",
          ourTokenDeployment.address
        );
      });
      it("was deployed", async () => {
        assert(ourToken.target);
      });
      describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token ", async () => {
          const totalSupply = await ourToken.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("initializes the token with the correct name and symbol ", async () => {
          const name = (await ourToken.name()).toString();
          assert.equal(name, "OurToken");

          const symbol = (await ourToken.symbol()).toString();
          assert.equal(symbol, "OT");
        });
      });
      describe("transfers", () => {
        it("Should be able to transfer tokens successfully to an address", async () => {
          const tokensToSend = ethers.parseEther("10");
          await ourToken.transfer(user1, tokensToSend);
          expect(await ourToken.balanceOf(user1)).to.equal(tokensToSend);
        });
        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            ourToken.transfer(user1, (10 * multiplier).toString())
          ).to.emit(ourToken, "Transfer");
        });
      });
      describe("allowances", () => {
        const amount = (20 * multiplier).toString();
        let playerToken; // Fix: Declare playerToken properly
        beforeEach(async () => {
          // Fix: Get the signer object for user1
          const accounts = await ethers.getSigners();
          const user1Signer = accounts[1];

          const ourTokenDeployment = await deployments.get("OurToken");
          playerToken = await ethers.getContractAt(
            "OurToken",
            ourTokenDeployment.address,
            user1Signer // Use the signer object, not just the address
          );
        });
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.parseEther("5");
          //Deployer is approving that user1 can spend 5 of their precious OT's
          await ourToken.approve(user1, tokensToSpend);
          await playerToken.transferFrom(deployer, user1, tokensToSpend);
          expect(await playerToken.balanceOf(user1)).to.equal(tokensToSpend);
        });
        it("doesn't allow an unnaproved member to do transfers", async () => {
          await expect(
            playerToken.transferFrom(deployer, user1, amount)
          ).to.be.revertedWithCustomError(
            playerToken,
            "ERC20InsufficientAllowance"
          );
        });
        it("emits an approval event, when an approval occurs", async () => {
          await expect(ourToken.approve(user1, amount)).to.emit(
            ourToken,
            "Approval"
          );
        });
        it("the allowance being set is accurate", async () => {
          await ourToken.approve(user1, amount);
          const allowance = await ourToken.allowance(deployer, user1);
          assert.equal(allowance.toString(), amount);
        });
        it("won't allow a user to go over the allowance", async () => {
          await ourToken.approve(user1, amount);
          await expect(
            playerToken.transferFrom(
              deployer,
              user1,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWithCustomError(
            playerToken,
            "ERC20InsufficientAllowance"
          );
        });
      });
    });
