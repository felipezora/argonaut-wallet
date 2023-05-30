/*
List of tests:
1. Owner equals to deployer of the contract => DONE
2. validTokenInstances[0] equals to address passed as argument when deployed => DONE
4. queryToken(0) returns token passed as arg when deployed => DONE
5. queryToken(invalid index) should revert with message Invalid index => DONE
6. registerToken as a common user should revert with message Not owner => DONE
7. registerToken as owner and then queryToken previously registered
8. getBalance(0) should return balance when called from owner account
9. transfer to account and then getBalance from account receiving the balance
*/

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

    it("Should revert with Invalid index", async () => {
      const { walletInstance } = await loadFixture(deployWalletWithBNB);

      await expect(walletInstance.queryToken(1)).to.be.revertedWith("Invalid index");
    });
  });

  describe("Register Token Validations", () => {

    it("Should revert with Not owner", async () => {
      const { walletInstance, otherAccount } = await loadFixture(deployWalletWithBNB);
      const anyAddress = "0x0000000000000000000000000000000000000000";

      const walletInstanceFromOther = await ethers.getContractAt("Wallet", walletInstance.address, otherAccount);

      await expect(walletInstanceFromOther.registerToken(anyAddress)).to.be.revertedWith("Not owner");
    });
  });
});