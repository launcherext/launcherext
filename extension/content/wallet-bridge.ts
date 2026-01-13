/**
 * Content Script: Wallet Bridge
 * Bridges wallet providers from webpage context to extension context
 * Required because extension popups can't directly access window.phantom/solana
 */

import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

// Detect available wallet providers in the page context
function detectWallets() {
  return {
    phantom: !!(window as any).phantom?.solana?.isPhantom,
    solflare: !!(window as any).solflare,
    solana: !!(window as any).solana?.isPhantom, // Some versions inject here
  };
}

// Listen for requests from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DETECT_WALLETS') {
    sendResponse(detectWallets());
    return true;
  }

  if (request.type === 'CONNECT_PHANTOM') {
    (async () => {
      try {
        const provider = (window as any).phantom?.solana || (window as any).solana;
        if (!provider || !provider.isPhantom) {
          sendResponse({ error: 'Phantom wallet not found' });
          return;
        }

        const resp = await provider.connect();
        sendResponse({
          success: true,
          publicKey: resp.publicKey.toString(),
        });
      } catch (error: any) {
        sendResponse({
          error: error.message || 'Connection failed',
        });
      }
    })();
    return true; // Keep message channel open for async response
  }

  if (request.type === 'CONNECT_SOLFLARE') {
    (async () => {
      try {
        const provider = (window as any).solflare;
        if (!provider) {
          sendResponse({ error: 'Solflare wallet not found' });
          return;
        }

        await provider.connect();
        sendResponse({
          success: true,
          publicKey: provider.publicKey.toString(),
        });
      } catch (error: any) {
        sendResponse({
          error: error.message || 'Connection failed',
        });
      }
    })();
    return true;
  }

  if (request.type === 'SIGN_TRANSACTION') {
    (async () => {
      try {
        const { transactionBase58, providerType } = request;

        const provider = providerType === 'phantom'
          ? ((window as any).phantom?.solana || (window as any).solana)
          : (window as any).solflare;

        if (!provider) {
          sendResponse({ error: `${providerType} wallet not found` });
          return;
        }

        // Deserialize using our bundled @solana/web3.js
        const txBytes = bs58.decode(transactionBase58);
        const tx = VersionedTransaction.deserialize(txBytes);

        // Sign with wallet provider
        const signedTx = await provider.signTransaction(tx);

        // Serialize and encode back
        const signedBytes = signedTx.serialize();
        const signedBase58 = bs58.encode(signedBytes);

        sendResponse({
          success: true,
          signedTransactionBase58: signedBase58,
        });
      } catch (error: any) {
        sendResponse({
          error: error.message || 'Transaction signing failed',
        });
      }
    })();
    return true;
  }
});

// Initial detection on load
window.addEventListener('load', () => {
  const wallets = detectWallets();
  chrome.runtime.sendMessage({
    type: 'WALLETS_DETECTED',
    wallets,
  });
});
