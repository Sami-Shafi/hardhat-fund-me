require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

const { GOERLI_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
	},
	networks: {
		goerli: {
			url: GOERLI_RPC_URL || "",
			accounts: [PRIVATE_KEY],
			chainId: 5,
            blockConfirmations: 6
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
    gasReporter: {
        enabled: true
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
