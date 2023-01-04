const { networkConfig, devChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	// destructure chainId and blockConfirmations
	const { chainId, blockConfirmations } = network.config;

	// const ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
	let ethUsdPriceFeedAddress;
	if (devChains.includes(network.name)) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	// ? localhost or hardhat -> mock
	const args = [ethUsdPriceFeedAddress];
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args, // ? price feed address
		log: true,
		waitConfimations: blockConfirmations || 1,
	});

	if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(fundMe.address, args);
	}

	log("--------------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
