#!/usr/bin/env bash

#   Sets up the developer environment quicker
git update-index --assume-unchanged ./run.bash ./setup.py
python ./setup.py ./.env.local SET
#   can commit developer agnostic changes with 'git update-index --no-assume-unchanged'

npx expo start
