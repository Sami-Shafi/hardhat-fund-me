const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
	const { deployer } = await getNamedAccounts();
	const fundMe = await ethers.getContract("FundMe", deployer);

	console.log("Withdrawing...");
	const transactionRes = await fundMe.withdraw();
	await transactionRes.wait(1);
	console.log("Withdraw Done...");
};

main()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
