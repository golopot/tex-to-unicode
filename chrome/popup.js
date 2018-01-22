document.querySelector('body').addEventListener('click', ev => {
  if (ev.target.tagName === 'A'){
    chrome.tabs.create({url: ev.target.href})
    return false
  }
})
