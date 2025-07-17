import {
    ethers,
    parseEther,
} from 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js'
import { abi, contractAddress } from './constant.js'

const connectButton = document.getElementById('connect')
connectButton.addEventListener('click', connectMetaMask)
document.getElementById('fund').addEventListener('click', fund)
document.getElementById('balance').addEventListener('click', getBalance)
document.getElementById('withdraw').addEventListener('click', withdraw)

async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            })
            console.log('Connected account:', accounts[0])
            connectButton.innerText = 'Connected: ' + accounts[0]
        } catch (error) {
            console.error('Error connecting to MetaMask:', error)
            connectButton.innerText = 'please connect to MetaMask'
        }
    } else {
        console.log(
            'MetaMask is not installed. Please install it to use this app.'
        )
    }
}

async function fund() {
    const ethAmount = document.getElementById('eth').value || '0.1'
    console.log('Funding with amount:', ethAmount)
    if (typeof window.ethereum !== 'undefined') {
        try {
            //provider /connection to the blockchain
            //signer / wallet / someone with gas
            //contract that we are interacting with
            //ABI / Application Binary Interface
            //address of the contract
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            console.log('Signer:', signer)
            const contract = new ethers.Contract(contractAddress, abi, signer)
            const txResponse = await contract.fund({
                value: parseEther(ethAmount),
            })
            await txResponse.wait(1) // wait for the transaction to be mined

            // const userAddress = await signer.getAddress();//use this to get the balance of your account
            const balance = await provider.getBalance(contractAddress)
            await listenForTrasactionMine(txResponse, provider)
            console.log('Done')
            // console.log('Balance after funding:', ethers.formatEther(balance))
        } catch (error) {
            console.error('Error funding')
        }
    } else {
        console.log('MetaMask is not installed.')
    }
}

async function listenForTrasactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}....`)
    const transactionReciept = await transactionResponse.wait(1)
    console.log(
        `Completed with ${await transactionReciept.confirmations()} confirmations`
    )
}
async function getBalance() {
    if (typeof window.ethereum != 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log('Balance :', ethers.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum != 'undefined') {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const balance = await provider.getBalance(contractAddress)
            console.log('Withdrawing Balance :', ethers.formatEther(balance))
            const signer = await provider.getSigner()
            console.log('Signer:', signer)
            const contract = new ethers.Contract(contractAddress, abi, signer)
            const Response = await contract.withdraw()
            await listenForTrasactionMine(Response,provider)
            await Response.wait(1) // wait for the transaction to be mined
        } catch (e) {
            console.log(e)
        }
    }
}
