#!/usr/bin/env bash
set -ex

if ! command -v task &> /dev/null; then
  brew install go-task
fi

task setup
