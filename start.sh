#! /bin/bash

npm install --dev
export NODE_ENV=production
./node_modules/.bin/webpack
cp dist/bundle.js static/bundle.js
node server.js