#/bin/sh
rm -f publish-pack.zip
zip -r publish-pack.zip \
  manifest.json \
  bundle.js \
  assets\
  background.js\
  popup.html\
  popup.js
