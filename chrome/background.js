chrome.commands.onCommand.addListener(command => {
  if (command === 'convert') {
    chrome.tabs.executeScript(null, { file: '/main.bundle.js' }, result =>
      console.log(result)
    )
  }
})
