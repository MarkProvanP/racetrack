# NOTE! Do not execute this file! We need to add the env variables to the current
# shell, so do 'source apply-heroku-env.sh' or '. apply-heroku-env.sh'

# Apply current Heroku environment to current shell

set -o allexport
source .env
set +o allexport
