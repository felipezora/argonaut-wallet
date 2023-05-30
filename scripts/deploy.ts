const { ethers, artifacts } = require("hardhat");

const main = async () => {

  const Token = await ethers.getContractFactory("BNBToken");
  const tokenName = "BNB";
  const tokenSymbol = "BNB";
  const token = await Token.deploy(tokenName, tokenSymbol, { value: "0" });

  await token.deployed();

  console.log(
    `Deployed token contract to ${token.address}`
  );

  const firstTokenAddress = token.address;

  const Wallet = await ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy(firstTokenAddress, { value: "0" });

  await wallet.deployed();

  console.log(
    `Deployed wallet contract to ${wallet.address}`
  );

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
