const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Wallet", () => {
  const deployWalletWithBNB = async () => {
    const [owner, otherAccount] = await ethers.getSigners();

    const tokenName = "BNB";
    const tokenSymbol = "BNB";
    const BNBToken = await ethers.getContractFactory("BNBToken");
    const bnbInstance = await BNBToken.deploy(tokenName, tokenSymbol, { value: 0 });

    const Wallet = await ethers.getContractFactory("Wallet");
    const walletInstance = await Wallet.deploy(bnbInstance.address, { value: 0 });
    return { owner, otherAccount, bnbInstance, walletInstance, tokenName, tokenSymbol };
  }

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const { owner, walletInstance } = await loadFixture(deployWalletWithBNB);

      expect(await walletInstance.owner()).to.equal(owner.address);
    });

    it("Should set the right address in the first position of validTokenInstances", async () => {
      const { bnbInstance, walletInstance } = await loadFixture(deployWalletWithBNB);

      expect(await walletInstance.validTokenInstances(0)).to.equal(bnbInstance.address);
    });
  });

  describe("Query Token Validations", () => {
    it("Should query first token instance's info", async () => {
      const { walletInstance, tokenName } = await loadFixture(deployWalletWithBNB);

      const tokenInfoArray = await walletInstance.queryToken(0);

      expect(tokenInfoArray.name).to.equal(tokenName);
    });

    it("Should revert with invalid index", async () => {
      const { walletInstance } = await loadFixture(deployWalletWithBNB);

      await expect(walletInstance.queryToken(1)).to.be.revertedWith("Invalid index");
    });
  });

  describe("Register Token Validations", () => {
    it("Should revert with Not owner", async () => {
      console.log(ethers.utils.isAddress("0x8ba1f109551bd432803012645ac136ddd64dba72"));
    });
  });
});