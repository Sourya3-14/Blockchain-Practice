// test/staging/OurToken.staging.test.js - Integration tests (testnet only)
const { assert, expect } = require("chai");
const { network, ethers, getNamedAccounts, deployments } = require("hardhat"); // Added missing imports
const { developmentChains } = require("../../helper-hardhat-config");

// ONLY run on testnets (skip on development and mainnet)
developmentChains.includes(network.name)
  ? describe.skip
  : describe("OurToken Staging Test", function () {
      let ourToken, deployer;

      beforeEach(async function () {
        try {
          // Get the deployer account
          const accounts = await getNamedAccounts();
          deployer = accounts.deployer;

          // Get the signer for the deployer
          const signer = await ethers.getSigner(deployer);

          // Get the deployed contract
          const OurTokenDeployment = await deployments.get("OurToken");

          // Create contract instance - Fixed variable name from 'raffle' to 'ourToken'
          ourToken = await ethers.getContractAt(
            "OurToken",
            OurTokenDeployment.address,
            signer
          );

          console.log(
            `Connected to OurToken at: ${OurTokenDeployment.address}`
          );
          console.log(`Using deployer: ${deployer}`);
        } catch (error) {
          console.error("Setup error:", error);
          throw error;
        }
      });

      it("allows transfers on testnet", async function () {
        // This test will take longer on testnet
        this.timeout(300000); // 5 minutes timeout

        // Test with small amounts to minimize gas costs
        const tokensToSend = ethers.parseEther("0.001");

        // Create a new wallet for testing (or use a predefined test address)
        const testWallet = ethers.Wallet.createRandom();
        const user1 = testWallet.address;

        console.log(
          `Transferring ${ethers.formatEther(tokensToSend)} tokens to ${user1}`
        );

        const initialBalance = await ourToken.balanceOf(user1);
        console.log(`Initial balance: ${ethers.formatEther(initialBalance)}`);

        const deployerInitialBalance = await ourToken.balanceOf(deployer);
        console.log(
          `Deployer initial balance: ${ethers.formatEther(
            deployerInitialBalance
          )}`
        );

        // Execute transfer
        const tx = await ourToken.transfer(user1, tokensToSend);
        await tx.wait(); // Wait for transaction confirmation

        const finalBalance = await ourToken.balanceOf(user1);
        const deployerFinalBalance = await ourToken.balanceOf(deployer);

        console.log(`Final balance: ${ethers.formatEther(finalBalance)}`);
        console.log(
          `Deployer final balance: ${ethers.formatEther(deployerFinalBalance)}`
        );

        // Check that tokens were transferred correctly
        expect(finalBalance).to.equal(initialBalance + tokensToSend);
        expect(deployerFinalBalance).to.equal(
          deployerInitialBalance - tokensToSend
        );
      });

      it("maintains correct total supply on testnet", async function () {
        this.timeout(60000); // 1 minute timeout

        const totalSupply = await ourToken.totalSupply();
        console.log(`Total supply: ${ethers.formatEther(totalSupply)}`);

        expect(totalSupply).to.be.gt(0); // Just verify it exists

        // Optional: Check if it matches expected initial supply
        // const expectedSupply = ethers.parseEther("1000000"); // Adjust based on your INITIAL_SUPPLY
        // expect(totalSupply).to.equal(expectedSupply);
      });

      it("has correct token metadata on testnet", async function () {
        this.timeout(60000);

        const name = await ourToken.name();
        const symbol = await ourToken.symbol();
        const decimals = await ourToken.decimals();

        console.log(`Token: ${name} (${symbol}) - ${decimals} decimals`);

        expect(name).to.equal("OurToken");
        expect(symbol).to.equal("OT");
        expect(decimals).to.equal(18);
      });

      it("deployer has initial token balance", async function () {
        this.timeout(60000);

        const deployerBalance = await ourToken.balanceOf(deployer);
        console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)}`);

        expect(deployerBalance).to.be.gt(0);
      });
    });
