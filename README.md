# sensorcentral-google-drive-backup #
Docker image used to backup the sensorcentral database and upload to Google Drive. The backup is performed 
with `pg_dump` and creates a compressed backup called `dump.latest-YYYYMMDD` in `/backup`. Once the backup completes 
the backup is copied to Google Drive.

## Environment variables ##
* POSTGRES_HOSTNAME
* POSTGRES_USERNAME
* POSTGRES_PASSWORD
* POSTGRES_DATABASE
* GOOGLE_DRIVE_PARENT_FOLDERID (if set files go in this folder)
* GOOGLE_TOKEN_FILE (defaults to `/settings/token.json`)
* GOOGLE_CREDENTIALS_FILE (defaults to `/settings/credentials.json`)
* GOOGLE_DRIVE_NUMBER_FILES (number of files to keep in the Google Drive folder)

## Building docker image ##
```
docker build --tag lekkim/sensorcentral-backup .
```

## Running with docker ##
```
docker run --rm --env-file ./.env -v /tmp:/backup -v ${PWD}/token.json:/settings/token.json lekkim/sensorcentral-backup
```
