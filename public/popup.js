document.getElementById('open-playpal').addEventListener('click', function () {
    chrome.tabs.create({ url: 'https://play-pal-five.vercel.app/', active: true });
});
