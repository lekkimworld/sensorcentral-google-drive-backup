require("dotenv").config();
const { google } = require("googleapis");
const { getClient, getParentFolderId } = require("./common");

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient) {
    const drive = google.drive({ version: "v3", auth: authClient });
    const args = {
        pageSize: 10,
        fields: "nextPageToken, files(id, name)"
    };
    const parentFolderId = getParentFolderId();
    if (parentFolderId) {
        args.q = `'${parentFolderId}' in parents`;
    }
    const res = await drive.files.list(args);
    const files = res.data.files;
    if (files.length === 0) {
        console.log("No files found.");
        return;
    }

    console.log("Files:");
    files.map((file) => {
        console.log(`${file.name} (${file.id})`);
    });
}

getClient().then(listFiles).catch(console.error);
