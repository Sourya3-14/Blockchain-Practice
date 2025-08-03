const { getWeth, AMOUNT } = require("./getWeth");
const { getNamedAccounts, ethers } = require("hardhat");
async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  //abi,contract address,signer
  //Pool Address Provider : 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e(https://aave.com/docs/resources/addresses)
  const iPool = await getPool(signer);
  console.log(`Pool Address: ${iPool.target}`); // will ne this: 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2

  //deposit WETH
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //weth address on ethereum mainnet

  // Approve the pool to spend WETH
  await approveERC20(wethAddress, iPool.target, AMOUNT, signer);

  // Deposit WETH into the Aave pool
  console.log("Depositing WETH into Aave pool...");
  await iPool.deposit(wethAddress, AMOUNT, deployer, 0);
  console.log(`Deposited ${AMOUNT} WETH into Aave pool`);

  // Borrow DAI
  //how much we have borrowed ,how much we have collateral and how much we can borrow
  let { totalDebtBase, availableBorrowsBase } = await getBorrowUserData(
    iPool,
    signer.address
  );

  const daiPrice = await getDAIPrice();
  const amountDAIToBorrow =
    availableBorrowsBase.toString() * 0.95 * (1 / Number(daiPrice)); // Borrow 95% of available borrows
  console.log(`Amount of DAI to borrow: ${amountDAIToBorrow} DAI`);
  const amountDAIToBorrowWei = ethers.parseEther(amountDAIToBorrow.toString());
  //availableBoroowsBase?? what the conversion date on DAI is?
  //Borrow time
  //how much we have borrowed,how much we have in collateral,how much we can borrow
  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI token tracker address on Ethereum mainnet
  await borrowDAI(daiTokenAddress, iPool, amountDAIToBorrowWei, signer);
  await getBorrowUserData(iPool, signer.address);

  // Repay DAI
  await repay(amountDAIToBorrowWei, daiTokenAddress, iPool, signer);
  await getBorrowUserData(iPool, signer.address);//a tiny amount of debt will still be there we can use uniswap to repay those debts
}
async function repay(amount, daiAddress, iPool, account) {
  await approveERC20(daiAddress, iPool.target, amount, account);
  const tx = await iPool.repay(daiAddress, amount, 2, account); // 1 is the interest rate mode (1 for stable, 2 for variable)
  await tx.wait(1);
  console.log(`Repaid ${amount} DAI`);
}

async function borrowDAI(daiAddress, iPool, amountDAIToBorrowWei, account) {
  const tx = await iPool.borrow(
    daiAddress,
    amountDAIToBorrowWei,
    2,
    0,
    account
  );

  await tx.wait(1);
  console.log(`Borrowed ${amountDAIToBorrowWei} DAI`);
  // 1 is the interest rate mode (1 for stable, 2 for variable)
}
async function getDAIPrice() {
  const daiPriceFeedAddress = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9" // DAI/USD price feed address ethereum mainnet
    // signer //dont need signer here, just need the contract address cause we will just be reading the price
  );
  const daiPrice = (await daiPriceFeedAddress.latestRoundData())[1];
  console.log(`DAI Price: ${daiPrice.toString()} USD`);
  return daiPrice;
}

async function getBorrowUserData(pool, account) {
  const { totalCollateralBase, totalDebtBase, availableBorrowsBase } =
    await pool.getUserAccountData(account);
  // console.log(`Total Collateral: ${totalCollateralBase.toString()}`);
  // console.log(`Total Debt: ${totalDebtBase.toString()}`);
  // console.log(`Available Borrows: ${availableBorrowsBase.toString()}`);
  // Formatted USD values (what they actually represent)
  console.log(
    `Total Collateral: $${ethers.formatUnits(totalCollateralBase, 8)} USD`
  );
  console.log(`Total Debt: $${ethers.formatUnits(totalDebtBase, 8)} USD`);
  console.log(
    `Available Borrows: $${ethers.formatUnits(availableBorrowsBase, 8)} USD`
  );
  return { totalDebtBase, availableBorrowsBase };
}
async function getPool(account) {
  const iPoolAddressesProvider = await ethers.getContractAt(
    "IPoolAddressesProvider",
    "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e", //copied from https://aave.com/docs/resources/addresses
    account
  );
  const PoolAddress = await iPoolAddressesProvider.getPool();
  const iPool = await ethers.getContractAt("IPool", PoolAddress, account);
  return iPool;
}
async function approveERC20(contractAddress, spenderAddress, amount, account) {
  const iERC20 = await ethers.getContractAt("IERC20", contractAddress, account);
  const tx = await iERC20.approve(spenderAddress, amount);
  await tx.wait(1);
  console.log(`Approved ${amount} tokens to ${spenderAddress}`);
}
main()
  .then((_) => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
