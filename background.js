browser.browserAction.onClicked.addListener(() => {
    browser.tabs.create({ url: 'https://tube.cadence.moe/filters' });
});