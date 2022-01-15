// @ts-nocheck

import {convertInputable} from '../lib/index';
chrome.storage.local.get(['options'], ({options = {}}) => {
  convertInputable(document.activeElement, options);
});
