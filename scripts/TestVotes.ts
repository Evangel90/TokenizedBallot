import { viem } from "hardhat";
import { parseEther } from "viem";

const MINT_VALUE = parseEther('10');

async function main() {
    const publicClient = await viem.getPublicClient();
    const [deployer, account1, account2] = await viem.getWalletClients();
    const contract = await viem.deployContract("MyToken");
    console.log(`Token deployed at ${contract.address}\n`)

    const mintTx = await contract.write.mint([account1.account.address, MINT_VALUE]);
    await publicClient.waitForTransactionReceipt({hash: mintTx});
    console.log(
      `Minted ${MINT_VALUE.toString()} decimal units to account ${
        account1.account.address
      }\n`
    )

    const balanceBN = await contract.read.balanceOf([account1.account.address]) as bigint
    console.log(
      `Account ${
        account1.account.address
      } has ${balanceBN.toString()} decimal units of MyToken\n`
    )

    const votes = await contract.read.getVotes([account1.account.address]) as bigint
    console.log(
      `Account ${
        account1.account.address
      } has ${votes.toString()} units of voting power before self delegation\n`
    )

    const delegateTx = await contract.write.delegate([account1.account.address], {
      account: account1.account
    })
    await publicClient.waitForTransactionReceipt({hash: delegateTx});
    const votesAfter = await contract.read.getVotes([account1.account.address]) as bigint
    console.log(
      `Account ${
        account1.account.address
      } has ${votesAfter.toString()} units of voting power before self delegation\n`
    )

    const transferTx = await contract.write.transfer(
        [account2.account.address, MINT_VALUE / 2n],
      {
        account: account1.account,
      }
    );
    await publicClient.waitForTransactionReceipt({ hash: transferTx });
    const votes1AfterTransfer = await contract.read.getVotes([
      account1.account.address,
    ]) as bigint;
    console.log(
      `Account ${
        account1.account.address
      } has ${votes1AfterTransfer.toString()} units of voting power after transferring\n`
    );
    const votes2AfterTransfer = await contract.read.getVotes([
      account2.account.address,
    ]) as bigint;
    console.log(
      `Account ${
        account2.account.address
      } has ${votes2AfterTransfer.toString()} units of voting power after receiving a transfer\n`
    );

    const delegateTx2 = await contract.write.delegate([account2.account.address], {
      account: account2.account
    })
    await publicClient.waitForTransactionReceipt({hash: delegateTx});
    const votesAfter2 = await contract.read.getVotes([account2.account.address]) as bigint
    console.log(
      `Account ${
        account2.account.address
      } has ${votesAfter2.toString()} units of voting power before self delegation\n`
    )

    const lastBlockNumber = await publicClient.getBlockNumber();
    for (let index = lastBlockNumber - 1n; index > 0n; index--) {
      const pastVotes = await contract.read.getPastVotes([
        account1.account.address,
        index,
      ]);
      console.log(
        `Account ${
          account1.account.address
        } had ${pastVotes.toString()} units of voting power at block ${index}\n`
      );
    }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
