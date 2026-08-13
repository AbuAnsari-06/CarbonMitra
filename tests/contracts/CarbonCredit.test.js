import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("CarbonCreditContract Smart Contract", function () {
  let CarbonCredit;
  let carbonCredit;
  let owner, farmer, buyer, nonAdmin;

  beforeEach(async function () {
    [owner, farmer, buyer, nonAdmin] = await ethers.getSigners();

    CarbonCredit = await ethers.getContractFactory("CarbonCreditContract");
    carbonCredit = await CarbonCredit.deploy();
    await carbonCredit.waitForDeployment();
  });

  it("Should set deployer as contract admin", async function () {
    expect(await carbonCredit.admin()).to.equal(owner.address);
    expect(await carbonCredit.name()).to.equal("CarbonMitra Verified Credit Token");
    expect(await carbonCredit.symbol()).to.equal("CMCT");
  });

  it("Should mint a new verified carbon credit token and emit CarbonCreditMinted event", async function () {
    const amountInTons = 1250; // 12.50 metric tons
    const landId = "land-101";
    const estimateId = "est-2026-001";
    const sentinelReqId = "sh-req-test-999";

    const tx = await carbonCredit.mintCredit(
      farmer.address,
      amountInTons,
      landId,
      estimateId,
      sentinelReqId
    );

    const receipt = await tx.wait();

    // Verify CarbonCreditMinted event
    await expect(tx)
      .to.emit(carbonCredit, "CarbonCreditMinted")
      .withArgs(1001, farmer.address, farmer.address, amountInTons, landId, estimateId, sentinelReqId);

    // Verify token details
    const credit = await carbonCredit.getCreditDetails(1001);
    expect(credit.tokenId).to.equal(1001);
    expect(credit.farmer).to.equal(farmer.address);
    expect(credit.currentOwner).to.equal(farmer.address);
    expect(credit.amountInTons).to.equal(amountInTons);
    expect(credit.landId).to.equal(landId);
    expect(credit.carbonEstimateId).to.equal(estimateId);
  });

  it("Should prevent double-minting with the same carbonEstimateId", async function () {
    const estimateId = "est-duplicate-check";

    await carbonCredit.mintCredit(farmer.address, 1000, "land-1", estimateId, "sh-1");

    await expect(
      carbonCredit.mintCredit(farmer.address, 1000, "land-1", estimateId, "sh-2")
    ).to.be.revertedWith("Carbon estimate already minted into a credit token");
  });

  it("Should transfer carbon credit to buyer and emit CarbonCreditTransferred event", async function () {
    const estimateId = "est-transfer-test";
    await carbonCredit.mintCredit(farmer.address, 1500, "land-2", estimateId, "sh-3");

    const priceInUsdCents = 30000; // $300.00
    const tx = await carbonCredit.transferCredit(1001, buyer.address, priceInUsdCents);

    await expect(tx)
      .to.emit(carbonCredit, "CarbonCreditTransferred");

    const credit = await carbonCredit.getCreditDetails(1001);
    expect(credit.currentOwner).to.equal(buyer.address);
  });

  it("Should restrict emergency MATIC withdrawal to contract admin", async function () {
    await expect(
      carbonCredit.connect(nonAdmin).withdrawTestnetMatic(nonAdmin.address)
    ).to.be.revertedWith("Only admin can call this function");
  });
});
