// Background service worker for Launch Ext
// Handles persistent logic, API calls, and message passing

console.log('Launch Ext background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Launch Ext installed');
    // Set default settings
    chrome.storage.local.set({
      settings: {
        rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=0e492ad2-d236-41dc-97e0-860d712bc03d',
        devBuyDefault: 0.1,
        slippageDefault: 10,
      },
    });
  }
});

// Message handler for popup <-> background communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  switch (message.type) {
    case 'GET_STORAGE':
      chrome.storage.local.get(message.key, (result) => {
        sendResponse({ success: true, data: result[message.key] });
      });
      return true; // Keep message channel open for async response

    case 'SET_STORAGE':
      chrome.storage.local.set({ [message.key]: message.value }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'FETCH_API':
      // Proxy API calls to avoid CORS issues
      fetch(message.url, message.options)
        .then(async (response) => {
          const data = await response.json();
          sendResponse({ success: true, data });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected:', port.name);
});
