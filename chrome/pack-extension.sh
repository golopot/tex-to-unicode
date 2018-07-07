#/bin/sh
rm -f pack-extension.zip
zip -r pack-extension.zip \
  manifest.json \
  bundle.js \
  assets\
  background.js\
  popup.html\
  popup.js
