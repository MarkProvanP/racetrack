#!/bin/bash
# Get current Heroku environment for running locally with 'heroku local'

heroku config -s > .env
