const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Wallet", () => {

  const deployWalletWithBNB = async () => {

    // In hardhat, contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    const tokenName = "BNB";
    const tokenSymbol = "BNB";
    const BNBToken = await ethers.getContractFactory("BNBToken");
    const bnbInstance = await BNBToken.deploy(tokenName, tokenSymbol, { value: 0 });

    const Wallet = await ethers.getContractFactory("Wallet");
    const walletInstance = await Wallet.deploy(bnbInstance.address, { value: 0 });
    return { owner, bnbInstance, walletInstance, tokenName, tokenSymbol };
  }

  const deployWalletWithBNBAndConnectOther = async () => {

    // In hardhat, contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const tokenName = "BNB";
    const tokenSymbol = "BNB";
    const BNBToken = await ethers.getContractFactory("BNBToken");
    const bnbInstance = await BNBToken.deploy(tokenName, tokenSymbol, { value: 0 });

    const Wallet = await ethers.getContractFactory("Wallet");
    const walletInstance = await Wallet.deploy(bnbInstance.address, { value: 0 });

    const walletInstanceFromOther = await ethers.getContractAt("Wallet", walletInstance.address, otherAccount);

    return { owner, otherAccount, bnbInstance, walletInstance, walletInstanceFromOther, tokenName, tokenSymbol };
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

      const DEFAULT_BNB_DECIMALS = 18;

      const { walletInstance, tokenName, tokenSymbol } = await loadFixture(deployWalletWithBNB);

      const tokenInfoArray = await walletInstance.queryToken(0);

      expect(tokenInfoArray).to.include.members([tokenName, tokenSymbol, DEFAULT_BNB_DECIMALS]);
    });

    it("Should revert with Invalid index", async () => {

      const { walletInstance } = await loadFixture(deployWalletWithBNB);

      await expect(walletInstance.queryToken(1)).to.be.revertedWith("Invalid index");
    });
  });

  describe("Register Token Validations", () => {

    it("Should revert with Not owner", async () => {

      const { walletInstanceFromOther } = await loadFixture(deployWalletWithBNBAndConnectOther);

      const randomAddress = "0x0000000000000000000000000000000000000000";

      await expect(walletInstanceFromOther.registerToken(randomAddress)).to.be.revertedWith("Not owner");
    });

    it("Should register a new validTokenInstance and query it", async () => {

      const { walletInstance } = await loadFixture(deployWalletWithBNB);

      const DEFAULT_BNB_DECIMALS = 18;

      const tokenName = "TEST";
      const tokenSymbol = "TEST";
      const TESTToken = await ethers.getContractFactory("BNBToken");
      const testInstance = await TESTToken.deploy(tokenName, tokenSymbol, { value: 0 });

      await walletInstance.registerToken(testInstance.address);

      const testTokenInstanceInfo = await walletInstance.queryToken(1);

      expect(testTokenInstanceInfo).to.include.members([tokenName, tokenSymbol, DEFAULT_BNB_DECIMALS]);
    });
  });

  describe("Get Balance validations", () => {

    it("Should get the BNB deployer account's BNB balance", async () => {

      const BNBInitialSupply = ethers.BigNumber.from("100000000000000000000");

      const BNB_INSTANCE_INDEX = 0;

      const { walletInstance } = await loadFixture(deployWalletWithBNB);

      expect(await walletInstance.getBalance(BNB_INSTANCE_INDEX)).to.deep.equal(BNBInitialSupply);
    });

    it("Should get the BNB balance of a random account", async () => {

      const { walletInstanceFromOther } = await loadFixture(deployWalletWithBNBAndConnectOther);

      const BNB_INSTANCE_INDEX = 0;

      const expectedRandomAccountBalance = ethers.BigNumber.from("0");

      expect(await walletInstanceFromOther.getBalance(BNB_INSTANCE_INDEX)).
        to.be.deep.equal(expectedRandomAccountBalance);
    });

    it("Transfer validations", () => {

      describe("Should transfer 10 BNB from account to other account", async () => {

        const { walletInstance, walletInstanceFromOther, otherAccount } = await loadFixture(deployWalletWithBNBAndConnectOther);

        // uint256 in solidity are mapped as BigNumber in javascript by ethers library
        const AMOUNT_TO_TRANSFER = ethers.BigNumber.from("10");

        const BNB_INSTANCE_INDEX = 0;

        await walletInstance.transfer(otherAccount.address, AMOUNT_TO_TRANSFER, BNB_INSTANCE_INDEX);

        expect(await walletInstanceFromOther.getBalance(BNB_INSTANCE_INDEX)).to.be.deep.equal(AMOUNT_TO_TRANSFER);
      });
    });
  });
});