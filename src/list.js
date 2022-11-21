require("dotenv").config();
const { google } = require("googleapis");
const { getClient, getListCommandLineArguments, printCommandLineUsage, listFiles } = require("./common");
const commandLineArgs = require("command-line-args");

const optionDefinitions = getListCommandLineArguments();
const options = commandLineArgs(optionDefinitions);
if (options.help) return printCommandLineUsage("Google Drive List", "List non-trashed files in Google Drive", optionDefinitions);
let folderId = options["folder-id"];
if (!folderId) {
    folderId = process.env.GOOGLE_DRIVE_PARENT_FOLDERID;
    console.log(`No folder-id specified - read <${folderId}> from environment`);
}

getClient().then(client => {
    return listFiles(client, folderId);
}).then(files => {
    if (files.length === 0) {
        console.log("No files found.");
        return;
    }

    console.log("Files:");
    files.map((file) => {
        console.log(`${file.name} (${file.id}) ${file.createdTime}`);
    });
}).catch(console.error);
