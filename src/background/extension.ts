chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'test') {
        console.log(' user clicked test');
        sendResponse({ message: 'Hello from the background script!' });
    }
});