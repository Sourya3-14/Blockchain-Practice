const { getNamedAccounts, ethers } = require("hardhat");

const AMOUNT = ethers.parseEther("0.01");

async function getWeth() {
  const { deployer } = await getNamedAccounts();

  // Get the signer for the deployer account
  const signer = await ethers.getSigner(deployer);
  //abi,contract address,signer

  // Connect the contract with the signer
  const iWeth = await ethers.getContractAt(
    "IWeth",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    signer // Use signer instead of deployer address
  );

  const tx = await iWeth.deposit({ value: AMOUNT });
  await tx.wait(1);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log(`Got ${wethBalance.toString()} WETH`);
}

module.exports = { getWeth,AMOUNT };
