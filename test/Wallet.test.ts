import { ethers } from "hardhat";
import { expect } from "chai";
import { constants } from "ethers";

import { Wallet, Proxy, MockERC20 } from "../typechain";

type WalletInstance = {
  proxy: Proxy;
  logic: Wallet;
}
const deployUpgradableWallet = async (): Promise<WalletInstance> => {
  const Wallet = await ethers.getContractFactory("Wallet");
  const logic: Wallet = await Wallet.deploy();
  await logic.deployed();

  // Deploy Contract itself as proxy
  // Get the init code
  const constructCode = logic.interface.encodeFunctionData("initialize");

  // Deploy the Proxy, using the init code for MasterChef
  const Proxy = await ethers.getContractFactory("Proxy");
  const proxy: Proxy = await Proxy.deploy(constructCode, logic.address);
  await proxy.deployed();
  return {
    proxy,
    logic
  };
}

describe("Wallet", () => {
  const AddressZero = constants.AddressZero;

  let admin, user1;
  let walletI: WalletInstance;
  let wallet: Wallet;
  let mockErc20: MockERC20;

  beforeEach(async () => {
    [admin, user1] = await ethers.getSigners();

    walletI = await deployUpgradableWallet();
    wallet = (await ethers.getContractAt("Wallet", walletI.proxy.address) as Wallet);

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockErc20 = await MockERC20.deploy();
    await mockErc20.deployed();
  });

  it("Should have the base contract deployments", async () => {
    expect(walletI.proxy.address).to.exist;
    expect(walletI.logic.address).to.exist;
    expect(await wallet.owner()).to.equal(admin.address);
    expect(await wallet.isOwner()).to.equal(true);
    expect(await wallet.initialized()).to.equal(true);
    expect(await walletI.logic.initialized()).to.equal(false);
  });

  it("Should not allow non owner to pull ERC20s", async () => {
    await mockErc20.allocateTo(wallet.address, "100");
    expect(await mockErc20.balanceOf(wallet.address)).to.equal("100");
    await expect(
      wallet.connect(user1).pullTokens(mockErc20.address, "0")
    ).to.be.revertedWith("Ownable: caller is not the owner");
    expect(await mockErc20.balanceOf(wallet.address)).to.equal("100");
  });

  it("Should allow owner to pull ERC20s", async () => {
    await mockErc20.allocateTo(wallet.address, "100");
    expect(await mockErc20.balanceOf(wallet.address)).to.equal("100");
    await wallet.connect(admin).pullTokens(mockErc20.address, "0")
    expect(await mockErc20.balanceOf(wallet.address)).to.equal("0");
    expect(await mockErc20.balanceOf(admin.address)).to.equal("100");
  });

  it("Should not allow non owner to pull ETH", async () => {
    expect(await ethers.provider.getBalance(wallet.address)).to.equal(0);
    await admin.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther("1.0")
    });
    expect(await ethers.provider.getBalance(wallet.address)).to.equal(ethers.utils.parseEther("1.0"));
    await expect(
      wallet.connect(user1).pullEth("0")
    ).to.be.revertedWith("Ownable: caller is not the owner");
    expect(await ethers.provider.getBalance(wallet.address)).to.equal(ethers.utils.parseEther("1.0"));
  });

  it("Should allow owner to pull ETH", async () => {
    expect(await ethers.provider.getBalance(wallet.address)).to.equal(0);
    await admin.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther("1.0")
    });
    expect(await ethers.provider.getBalance(wallet.address)).to.equal(ethers.utils.parseEther("1.0"));
    await expect(await wallet.connect(admin).pullEth("0"))
      .to.changeEtherBalance(wallet, ethers.utils.parseEther("-1.0"));
    expect(await ethers.provider.getBalance(wallet.address)).to.equal(0);
  });
});