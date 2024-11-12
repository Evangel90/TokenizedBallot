import { task, type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.PROVIDER_API_KEY || "";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || "";

if (!providerApiKey || !deployerPrivateKey) {
  throw new Error("Please set your PROVIDER_API_KEY and DEPLOYER_PRIVATE_KEY in a .env file");
}

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
  },
};

task('accounts', 'Prints the list of accounts', async(taskArgs, hre)=>{
  const accounts = await hre.viem.getWalletClients();
  for(const account of accounts){
    console.log(account.account.address);
  }
});

export default config;
