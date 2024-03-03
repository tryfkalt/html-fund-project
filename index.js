import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected!";
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding ${ethAmount} ETH`);
  if (typeof window.ethereum !== "undefined") {
    // Web3Provider is an object that wraps the Ethereum provider
    const provider = new ethers.providers.Web3Provider(window.ethereum); // this case our provider is MetaMask
    const signer = provider.getSigner(); // this is going to return the wallet connected to the provider
    console.log(signer);
    const contract = new ethers.Contract(contractAddress, abi, signer); // now we have the contract object connected to the signer
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount), //  here we need utils because we imported ethers from web browser
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

// listens for the transaction to be mined
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // create a listener for the transaction
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (receipt) => {
      console.log(`Mined!`);
      resolve(receipt.confirmations);
    });
  });
}

// returns the balance of the contract
async function getBalance(){
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}