const web3 = new Web3(new Web3.providers.HttpProvider('https://testnet-rpc.monad.xyz'));

const NFT_CONTRACT = '0x922dA3512e2BEBBe32bccE59adf7E6759fB8CEA2';
const NFT_ABI = [
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function'
    }
];

const TOKEN_ABI = [
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        type: 'function'
    }
];

const TOKENS = [
    { symbol: 'CHOG', address: '0xE0590015A873bF326bd645c3E1266d4db41C4E6B', icon: 'chog.png' },
    { symbol: 'DAK', address: '0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714', icon: 'dak.png' },
    { symbol: 'YAKI', address: '0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50', icon: 'yaki.png' }
];

const nftContract = new web3.eth.Contract(NFT_ABI, NFT_CONTRACT);
let currentLanguage = 'en';

// Функция задержки
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
            row.insertCell(2).innerText = currentLanguage === 'en' ? 'Invalid' : 'Невалиден';
            row.insertCell(3).innerText = '-';
            TOKENS.forEach(() => row.insertCell(-1).innerText = '-');
            continue;
        }

        try {
            const balanceWei = await web3.eth.getBalance(address);
            const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
            const hasNFT = await checkNFT(address);

            row.insertCell(0).innerText = i + 1;
            row.insertCell(1).innerHTML = `${address} <a href="https://testnet.monadexplorer.com/address/${address}" target="_blank"><img src="./icon.svg" style="width: 20px; vertical-align: middle;" /></a>`;
            row.insertCell(2).innerText = `${balanceEther} MONAD`;

            const nftCell = row.insertCell(3);
            nftCell.innerText = hasNFT ? (currentLanguage === 'en' ? 'Yes' : 'Да') : (currentLanguage === 'en' ? 'No' : 'Нет');
            nftCell.style.backgroundColor = hasNFT ? '#4CAF50' : 'transparent';
            nftCell.style.color = hasNFT ? 'white' : 'inherit';

            // Задержка перед запросами баланса токенов
            await sleep(1000); // Задержка 1 секунда

            // Получение баланса токенов для каждого токена
            for (const token of TOKENS) {
                const tokenCell = row.insertCell(-1);
                const tokenContract = new web3.eth.Contract(TOKEN_ABI, token.address);

                try {
                    const [balanceRaw, decimals] = await Promise.all([
                        tokenContract.methods.balanceOf(address).call(),
                        tokenContract.methods.decimals().call()
                    ]);

                    const balance = parseFloat(balanceRaw) / (10 ** decimals);

                    if (balance > 0) {
                        // Создаем контейнер для иконки и баланса
                        const tokenContainer = document.createElement('div');
                        tokenContainer.style.display = 'flex';
                        tokenContainer.style.alignItems = 'center';

                        // Добавляем иконку
                        const tokenIcon = document.createElement('img');
                        tokenIcon.src = token.icon;
                        tokenIcon.alt = token.symbol;
                        tokenIcon.style.height = '20px';
                        tokenIcon.style.marginRight = '5px';

                        // Добавляем текст с балансом
                        const tokenText = document.createElement('span');
                        tokenText.textContent = balance.toFixed(4);
                        tokenText.title = `${balance.toFixed(4)} ${token.symbol}`;

                        tokenContainer.appendChild(tokenIcon);
                        tokenContainer.appendChild(tokenText);

                        tokenCell.appendChild(tokenContainer);
                    } else {
                        tokenCell.innerText = '-';
                    }
                } catch (e) {
                    console.error(e);
                    tokenCell.innerText = '?';
                }
            }
        } catch (err) {
            console.error(err);
            row.insertCell(0).innerText = i + 1;
            row.insertCell(1).innerText = address;
            row.insertCell(2).innerText = currentLanguage === 'en' ? 'Error' : 'Ошибка';
            row.insertCell(3).innerText = '-';
            TOKENS.forEach(() => row.insertCell(-1).innerText = '-');
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
        console.error('NFT check error:', error);
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
            thNFT: "1M MONAD NFT",
            thCHOG: "CHOG",
            thDAK: "DAK",
            thYAKI: "YAKI"
        },
        ru: {
            labelAddress: "Введите адреса кошельков (по одному на строке):",
            buttonText: "Проверить балансы",
            resultHeader: "Результаты проверки балансов",
            thNumber: "№",
            thAddress: "Адрес",
            thBalance: "Баланс",
            thNFT: "1M MONAD NFT",
            thCHOG: "CHOG",
            thDAK: "DAK",
            thYAKI: "YAKI"
        }
    };

    const t = texts[language];
    document.getElementById('label-address').textContent = t.labelAddress;
    document.getElementById('check-button-text').textContent = t.buttonText;
    document.getElementById('result-header').textContent = t.resultHeader;
    document.getElementById('th-number').textContent = t.thNumber;
    document.getElementById('th-address').textContent = t.thAddress;
    document.getElementById('th-balance').textContent = t.thBalance;
    document.getElementById('th-nft').textContent = t.thNFT;
    document.getElementById('th-chog').textContent = t.thCHOG;
    document.getElementById('th-dak').textContent = t.thDAK;
    document.getElementById('th-yaki').textContent = t.thYAKI;
}
