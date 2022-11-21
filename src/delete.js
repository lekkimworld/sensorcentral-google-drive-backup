require("dotenv").config();
const { google } = require("googleapis");
const { getClient, getDeleteCommandLineArguments, printCommandLineUsage } = require("./common");
const commandLineArgs = require("command-line-args");

const optionDefinitions = getDeleteCommandLineArguments();
const options = commandLineArgs(optionDefinitions);
if (options.help) return printCommandLineUsage("Google Drive List", "List non-trashed files in Google Drive", optionDefinitions);
let fileId = options["id"];
if (!fileId) {
    console.error(`No id specified - aborting`);
    process.exit(1);
}
console.log(`Deleting file with ID <${fileId}>`);

async function deleteFileId(authClient, fileId) {
    const drive = google.drive({ version: "v3", auth: authClient });
    drive.files.delete({
        fileId
    })
}

getClient().then(client => {
    return deleteFileId(client, fileId);
}).catch(console.error);
