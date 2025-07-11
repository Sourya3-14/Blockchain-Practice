const { Wallet } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const wallet = new Wallet(process.env.PRIVATE_KEY); // private key from .env file
  const ecryptedJsonKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD
  );

  console.log("Encrypted JSON Key:");
  console.log(ecryptedJsonKey);

  fs.writeFileSync("./encryptedKey.json", ecryptedJsonKey, "utf8");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
