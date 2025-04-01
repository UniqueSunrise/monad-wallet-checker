const web3 = new Web3(new Web3.providers.HttpProvider('https://testnet-rpc.monad.xyz'));

const NFT_CONTRACT = '0x922dA3512e2BEBBe32bccE59adf7E6759fB8CEA2';
const NFT_ABI = [
    {
        "constant": true,
        "inputs": [{ "name": "owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    }
];

const nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT);
let currentLanguage = 'en';

document.getElementById('address-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const buttonLogo = document.getElementById('button-logo');
    const checkButtonText = document.getElementById('check-button-text');
    
    checkButtonText.style.visibility = 'hidden';
    buttonLogo.style.visibility = 'visible';

    const addresses = document.getElementById('addresses').value.split('\n').map(addr => addr.trim()).filter(addr => addr);
    const tableBody = document.querySelector('#balance-table tbody');
    tableBody.innerHTML = '';
    document.getElementById('result').style.display = 'none';

    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const row = tableBody.insertRow();

        if (!web3.utils.isAddress(address)) {
            row.insertCell(0).innerText = i + 1;
            row.insertCell(1).innerText = address;
            row.insertCell(2).innerText = currentLanguage === 'en' ? "Invalid" : "Невалиден";
            row.insertCell(3).innerText = "-";
            continue;
        }

        try {
            const balanceWei = await web3.eth.getBalance(address);
            const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
            const hasNFT = await checkNFT(address);
            
            row.insertCell(0).innerText = i + 1;
            row.insertCell(1).innerHTML = `${address} <a href="https://testnet.monadexplorer.com/address/${address}" target="_blank"><img src="./icon.svg" alt="Monad Icon" style="width: 20px; height: 20px; vertical-align: middle;" /></a>`;
            row.insertCell(2).innerText = `${balanceEther} MONAD`;
            
            const nftCell = row.insertCell(3);
            nftCell.innerText = hasNFT ? (currentLanguage === 'en' ? "Yes" : "Да") : (currentLanguage === 'en' ? "No" : "Нет");
            nftCell.style.backgroundColor = hasNFT ? "#4CAF50" : "transparent";
            nftCell.style.color = hasNFT ? "white" : "inherit";
        } catch (error) {
            row.insertCell(0).innerText = i + 1;
            row.insertCell(1).innerText = address;
            row.insertCell(2).innerText = currentLanguage === 'en' ? "Error" : "Ошибка";
            row.insertCell(3).innerText = currentLanguage === 'en' ? "Error" : "Ошибка";
        }
    }

    buttonLogo.style.visibility = 'hidden';
    checkButtonText.style.visibility = 'visible';
    document.getElementById('result').style.display = 'block';
});

async function checkNFT(address) {
    try {
        const balance = await nftContract.methods.balanceOf(address).call();
        return parseInt(balance) > 0;
    } catch (error) {
        console.error('Ошибка при проверке NFT:', error);
        return false;
    }
}

function changeLanguage(language) {
    currentLanguage = language;
    const texts = {
        en: {
            labelAddress: "Enter wallet addresses (one per line):",
            buttonText: "Check Balances",
            resultHeader: "Balance Checking Results",
            thNumber: "Number",
            thAddress: "Address",
            thBalance: "Balance",
            thNFT: "1M MONAD NFT"
        },
        ru: {
            labelAddress: "Введите адреса кошельков (по одному на строке):",
            buttonText: "Проверить балансы",
            resultHeader: "Результаты проверки балансов",
            thNumber: "Номер",
            thAddress: "Адрес",
            thBalance: "Баланс",
            thNFT: "1M MONAD NFT"
        }
    };

    document.getElementById('label-address').textContent = texts[language].labelAddress;
    document.getElementById('check-button-text').textContent = texts[language].buttonText;
    document.getElementById('result-header').textContent = texts[language].resultHeader;
    document.getElementById('th-number').textContent = texts[language].thNumber;
    document.getElementById('th-address').textContent = texts[language].thAddress;
    document.getElementById('th-balance').textContent = texts[language].thBalance;
    document.getElementById('th-nft').textContent = texts[language].thNFT;
}
