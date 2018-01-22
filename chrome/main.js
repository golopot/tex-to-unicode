import {translate} from '../lib/index'
import symbols from '../lib/symbols'

(function main(){
  const textarea = document.activeElement
  if (!(textarea.tagName === 'INPUT' || textarea.tagName === 'TEXTAREA')){
    return
  }
  let {selectionStart, selectionEnd} = textarea
  const {text, cursor} = translate(textarea.value, selectionStart, selectionEnd, symbols)
  textarea.value = text
  textarea.selectStart = textarea.selectionEnd = cursor
})()
