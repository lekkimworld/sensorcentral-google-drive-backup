
Uses `pg_dump` to dump the supplied database to a compressed backup called `dump.latest` in `/backup`. Once the backup completes the backup is copied to Google Drive.

## Environment variables ##
* POSTGRES_HOSTNAME
* POSTGRES_USERNAME
* POSTGRES_PASSWORD
* POSTGRES_DATABASE
* GOOGLE_DRIVE_PARENT_FOLDERID (if set files go in this folder)
* GOOGLE_CREDENTIALS_FILE (defaults to `/settings/credentials.json`)
* DUMP_FILENAME_FORMAT (defaults to `dump.latest-${YYYYMMDD}`)

## Running with docker ##
```
docker build --tag lekkim/sensorcentral-backup .
```

## Running with docker ##
```
docker run --rm --env-file ./.env -v /tmp:/backup -v ${PWD}/token.json:/settings/token.json lekkim/sensorcentral-backup
```
