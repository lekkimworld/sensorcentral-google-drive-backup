require("dotenv").config();
const { google } = require("googleapis");
const { getClient, getDeleteCommandLineArguments, printCommandLineUsage, deleteFileId } = require("./common");
const commandLineArgs = require("command-line-args");

const optionDefinitions = getDeleteCommandLineArguments();
const options = commandLineArgs(optionDefinitions);
if (options.help) return printCommandLineUsage("Google Drive Delete", "Deletes a file in Google Drive by ID", optionDefinitions);
let fileId = options["id"];
if (!fileId) {
    console.error(`No id specified - aborting`);
    process.exit(1);
}
console.log(`Deleting file with ID <${fileId}>`);

getClient().then(client => {
    return deleteFileId(client, fileId);
}).catch(console.error);
