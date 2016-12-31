# Racetrack

Software to manage Race2 or some other Jailbreak-style event with text messages etc

Designed to be put on Heroku

Based on Angular2-Webpack-Starter and Angular hero tutorials

# Configuration

Configuration is done through environment variables

` APP_NAME ` - Name for app/event

` APP_URL ` - URL for app

` DATA_EMAIL_RECIPIENTS ` - Comma-separated list of email addresses where emails for data should be sent (e.g. when text sent or received)

` ERROR_EMAIL_RECIPIENTS ` - Comma-separated list of email addresses where error emails should be sent

` STATUS_EMAIL_RECIPIENTS ` - Comma-separated list of email addresses where status updates should be sent (e.g. server now running)

` GMAIL_CLIENT_ID ` - OAuth2 Client ID for app Gmail account

` GMAIL_CLIENT_SECRET ` - OAuth2 Client Secret for app Gmail account

` GMAIL_REFRESH_TOKEN ` - OAuth2 Refresh Token for app Gmail account

` GMAIL_USER ` - Gmail email address for app

` GOOGLE_MAPS_API_KEY ` - API key for Google Maps

` MONGODB_URI ` - URI for MongoDB database

` RACE2_ADMIN_PASSWORD ` - Password for app 'admin' superuser

` TWILIO_AUTH_TOKEN ` - Twilio Auth Token

` TWILIO_SENDING_NO ` - Full Twilio number (e.g. +4401234 567890)

` TWILIO_SID ` - Twilio SID

` TWILIO_SMS_WEBHOOK` - Twilio webhook URL for receiving texts

# Other stuff

HTTPS support is included when the ` HTTPS_FORCE ` env variable is set (to anything, even 'false' - it must be the empty string or non-existent to be false - the wonders of JavaScript...).
When set, when the application detects that it is running on Heroku it will force all HTTP requests to be redirected to HTTPS,
and will trust the X-Forwarded-Proto header as this is Heroku's proxy server.
Also included is a mechanismto load up ACME challenge-response pairs, using a JSON-encoded array of {request: "/.well-known/bleh", response: "keyboard-cat"} objects as the` ACME_CHALLENGES ` ENV variable.
http://collectiveidea.com/blog/archives/2016/01/12/lets-encrypt-with-a-rails-app-on-heroku

# License
 [MIT](/LICENSE)
