require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		compilers: [{ version: "0.8.8" }],
	},
	networks: {
		goerli: {
			url: process.env.GOERLI_RPC_URL || "",
			accounts: [process.env.PRIVATE_KEY],
			chainId: 5,
		},
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		user: {
			default: 1,
		},
	},
};
