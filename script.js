const web3 = new Web3(new Web3.providers.HttpProvider('https://testnet-rpc.monad.xyz'));

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
            row.insertCell(2).innerText = "Невалиден";
            continue;
        }

        try {
            const balanceWei = await web3.eth.getBalance(address);
            const balanceEther = web3.utils.fromWei(balanceWei, 'ether');

            row.insertCell(0).innerText = i + 1;
            row.insertCell(1).innerHTML = `${address} <a href="https://testnet.monadexplorer.com/address/${address}" target="_blank"><img src="./icon.svg" alt="Monad Icon" style="width: 20px; height: 20px; margin-left: 10px; vertical-align: middle;" /></a>`;
            row.insertCell(2).innerText = `${balanceEther} MONAD`;
        } catch (error) {
            row.insertCell(0).innerText = i + 1;
            row.insertCell(1).innerText = address;
            row.insertCell(2).innerText = "Ошибка при запросе";
        }
    }

    buttonLogo.style.visibility = 'hidden';
    checkButtonText.style.visibility = 'visible';
    document.getElementById('result').style.display = 'block';
});

function changeLanguage(language) {
    const texts = {
        en: {
            labelAddress: "Enter wallet addresses (one per line):",
            buttonText: "Check Balances",
            resultHeader: "Balance Checking Results",
            thNumber: "Number",
            thAddress: "Address",
            thBalance: "Balance"
        },
        ru: {
            labelAddress: "Введите адреса кошельков (по одному на строку):",
            buttonText: "Проверить балансы",
            resultHeader: "Результаты проверки балансов",
            thNumber: "Номер",
            thAddress: "Адрес",
            thBalance: "Баланс"
        }
    };

    document.getElementById('label-address').textContent = texts[language].labelAddress;
    document.getElementById('check-button-text').textContent = texts[language].buttonText;
    document.getElementById('result-header').textContent = texts[language].resultHeader;
    document.getElementById('th-number').textContent = texts[language].thNumber;
    document.getElementById('th-address').textContent = texts[language].thAddress;
    document.getElementById('th-balance').textContent = texts[language].thBalance;
}
