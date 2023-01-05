const { assert } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { devChains } = require("../../helper-hardhat-config");

devChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async () => {
			let fundMe;
			let deployer;
			const sendValue = ethers.utils.parseEther("1");
			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				fundMe = await ethers.getContract("FundMe", deployer);
			});

			it("Allows Fund and Withdraw", async () => {
				await fundMe.fund({ value: sendValue });
				await fundMe.withdraw();

				let endBalance = await fundMe.provider.getBalance(
					fundMe.address
				);
				assert.equal(endBalance.toString(), "0");
			});
	  });
