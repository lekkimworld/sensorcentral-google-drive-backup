require("dotenv").config();
const { google } = require("googleapis");
const { getClient, getParentFolderId, getListCommandLineArguments, printCommandLineUsage } = require("./common");
const commandLineArgs = require("command-line-args");

const optionDefinitions = getListCommandLineArguments();
const options = commandLineArgs(optionDefinitions);
if (options.help) return printCommandLineUsage("Google Drive List", "List non-trashed files in Google Drive", optionDefinitions);
let folderId = options["folder-id"];
if (!folderId) {
    folderId = process.env.GOOGLE_DRIVE_PARENT_FOLDERID;
    console.log(`No folder-id specified - read <${folderId}> from environment`);
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient, folderId) {
    const drive = google.drive({ version: "v3", auth: authClient });
    const args = {
        pageSize: 20,
        fields: "nextPageToken, files(id, name)",
        orderBy: "createdTime",
        q: `trashed = false`
    };
    if (folderId) {
        args.q = `${args.q} and '${folderId}' in parents`;
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

getClient().then(client => {
    return listFiles(client, folderId);
}).catch(console.error);
