document.addEventListener('DOMContentLoaded', () => {
  const walletModal = document.getElementById('wallet-modal');
  const closeModalBtn = document.getElementById('close-wallet-modal');

  const btnMetaMask = document.getElementById('btn-metamask');
  const btnBinance = document.getElementById('btn-binance');
  const btnWalletConnect = document.getElementById('btn-walletconnect');

  // Cancel → back to index.html
  closeModalBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Click outside modal → close
  walletModal.addEventListener('click', (e) => {
    if (e.target === walletModal) {
      walletModal.style.display = 'none';
    }
  });

  // MetaMask Connect
  btnMetaMask.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        alert('MetaMask connected: ' + walletAddress);
      } catch (err) {
        alert('User rejected MetaMask connection.');
      }
    } else {
      alert('MetaMask not found. Please install from https://metamask.io');
      window.open('https://metamask.io', '_blank');
    }
  });

  // Binance Wallet Connect
  btnBinance.addEventListener('click', async () => {
    if (typeof window.BinanceChain !== 'undefined') {
      try {
        const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        alert('Binance Wallet connected: ' + walletAddress);
      } catch (err) {
        alert('User rejected Binance connection.');
      }
    } else {
      alert('Binance Wallet not found. Please install from https://www.bnbchain.org/en/binance-wallet');
      window.open('https://www.bnbchain.org/en/binance-wallet', '_blank');
    }
  });

  // WalletConnect
  btnWalletConnect.addEventListener('click', () => {
    alert('WalletConnect integration coming soon!');
  });
});
