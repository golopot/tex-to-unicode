chrome.commands.onCommand.addListener((command) => {
  if (command === 'TeX-to-unicode'){
    chrome.tabs.executeScript(null, {file: '/bundle.js'})
  }
})
