chrome.commands.onCommand.addListener((command) => {
  if (command === 'convert') {
    chrome.tabs.executeScript(null, {file: '/main.bundle.js'}, (result) =>
      console.log(result)
    );
  }
});

chrome.storage.local.get(['options'], ({options = {}}) => {
  const opt = {
    subscripts:
      typeof options.subscripts === 'boolean' ? options.subscripts : false,
  };

  chrome.storage.local.set({options: opt});
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({options: {subscripts: false}});
});
