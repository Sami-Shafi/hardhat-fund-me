const { assert, expect } = require("chai");
const { deployments, ethers } = require("hardhat");

describe("FundMe", async () => {
	let fundMe;
	let deployer;
	let mockV3Aggregator;
	const sendValue = ethers.utils.parseEther("1");
	beforeEach(async () => {
		// const accounts = await ethers.getSigners();
		// const accountZero = accounts[0];
		deployer = (await getNamedAccounts()).deployer;
		await deployments.fixture(["all"]);
		fundMe = await ethers.getContract("FundMe");
		mockV3Aggregator = await ethers.getContract(
			"MockV3Aggregator",
			deployer
		);
	});

	describe("constructor", async () => {
		it("Sets the aggregator addresses correctly", async () => {
			const response = await fundMe.priceFeed();
			assert.equal(response, mockV3Aggregator.address);
		});
	});

	describe("fund", async () => {
		it("Fails if you don't send enough ETH!", async () => {
			await expect(fundMe.fund()).to.be.revertedWith(
				"You need to spend more ETH!"
			);
		});

		it("Updated the amount funded data structure.", async () => {
			await fundMe.fund({ value: sendValue });
			const response = await fundMe.addressToAmountFunded(deployer);
			assert.equal(response.toString(), sendValue.toString());
		});

		it("Adds funder to array of funders", async () => {
			await fundMe.fund({ value: sendValue });
			const funder = await fundMe.funders(0);
			assert.equal(funder, deployer);
		});
	});

	describe("withdraw", async () => {
		beforeEach(async () => {
			await fundMe.fund({ value: sendValue });
		});

		it("Withdraw ETH from a single funder", async () => {
			// get the starting balance of the contract and the withdrawer
			const startingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const startingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);

			// withdraw eveything from contract
			const txResponse = await fundMe.withdraw();
			const txReceipt = await txResponse.wait(1);

			// pull and get gas price total
			const { gasUsed, effectiveGasPrice } = txReceipt;
			const calculateGas = gasUsed.mul(effectiveGasPrice);

			// get the withdrawer's balance and the contract balance
			const endingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const endingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);

			// all of the contract balance should be sent to the withdrawer
			assert.equal(endingFundMeBalance, 0);
			assert.equal(
				startingFundMeBalance.add(startingDeployerBalance).toString(),
				endingDeployerBalance.add(calculateGas).toString()
			);
		});

		it("Withdraw ETH from multiple funder", async () => {
			const accounts = await ethers.getSigners();

			for (i = 1; i < 6; i++) {
				const fundMeConnectedContract = await fundMe.connect(
					accounts[i]
				);
				await fundMeConnectedContract.fund({ value: sendValue });
			}

			// get the starting balances of the contract and the withdrawers
			const startingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const startingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);

			// withdraw eveything from contract
			const txResponse = await fundMe.withdraw();
			const txReceipt = await txResponse.wait(1);

			// pull and get gas price total
			const { gasUsed, effectiveGasPrice } = txReceipt;
			const calculateGas = gasUsed.mul(effectiveGasPrice);

			// get the withdrawer's balance and the contract balance
			const endingFundMeBalance = await fundMe.provider.getBalance(
				fundMe.address
			);
			const endingDeployerBalance = await fundMe.provider.getBalance(
				deployer
			);

			// all of the contract balance should be sent to the withdrawer
			assert.equal(endingFundMeBalance, 0);
			assert.equal(
				startingFundMeBalance.add(startingDeployerBalance).toString(),
				endingDeployerBalance.add(calculateGas).toString()
			);

			// reset funders array
			await expect(fundMe.funders(0)).to.be.reverted;
			for (i = 1; i < 6; i++) {
				assert.equal(
					await fundMe.addressToAmountFunded(accounts[i].address),
					0
				);
			}
		});

		it("Only allows owner to withdraw", async () => {
			const accounts = await ethers.getSigners();
			const attacker = accounts[1];
			const attackerConnectedContract = await fundMe.connect(attacker);
			await expect(
				attackerConnectedContract.withdraw()
			).to.be.revertedWithCustomError(fundMe, "FundMe_NotOwner");
		});
	});
});
