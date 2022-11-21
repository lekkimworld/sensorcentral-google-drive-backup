echo $POSTGRES_HOSTNAME:5432:$POSTGRES_USERNAME:$POSTGRES_USERNAME:$POSTGRES_PASSWORD > ~/.pgpass
chmod 600 ~/.pgpass
pg_dump -h $POSTGRES_HOSTNAME -U $POSTGRES_USERNAME --no-owner --no-acl $POSTGRES_DATABASE -Fc > /backup/dump.latest-`date "+%Y%m%d"`
node src/upload.js --filename=/backup/dump.latest-%TODAY --folder-id=$GOOGLE_DRIVE_PARENT_FOLDERID
rm /backup/dump.latest-`date "+%Y%m%d"`
node src/ensure-max-number-files.js --maximum-number-files=2 --folder-id=$GOOGLE_DRIVE_PARENT_FOLDERID
