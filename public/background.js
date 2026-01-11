chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: "index.html"
    });
});


chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: 'https://play-pal-five.vercel.app/' });
});
