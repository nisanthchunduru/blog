#!/usr/bin/env bash

set -e

asdf plugin-add nodejs
asdf plugin-add golang
asdf install

npm install

npm run tw:build

brew install hugo
