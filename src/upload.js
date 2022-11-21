require("dotenv").config();
const {getClient, getUploadCommandLineArguments, getPath, uploadFile, printCommandLineUsage} = require("./common");
const path = require("path");
const { google } = require("googleapis");
const commandLineArgs = require("command-line-args");

const optionDefinitions = getUploadCommandLineArguments();
const options = commandLineArgs(optionDefinitions);
if (options.help)
    return printCommandLineUsage("Google Drive Upload", "Uploads a file to Google Drive", optionDefinitions);
let folderId = options["folder-id"];
if (!folderId) {
    folderId = process.env.GOOGLE_DRIVE_PARENT_FOLDERID;
    console.log(`No folder-id specified - read <${folderId}> from environment`);
}
let filename = options["filename"];
if (!filename) {
    console.error("No filename argument specified - aborting");
    process.exit(1);
}
filename = getPath(filename);
console.log(`Read filename <${filename}>`);
if (filename.indexOf("%TODAY") >= 0) {
    let idx = filename.indexOf("%TODAY");
    const now = new Date();
    const TODAY = `${now.getFullYear()}${
        now.getMonth() + 1 < 10 ? "0" + now.getMonth() + 1 : now.getMonth() + 1
    }${now.getDate()}`;
    filename = `${filename.substring(0, idx)}${TODAY}${filename.substring(idx + 6)}`;
} else if (filename.indexOf("%NOW") >= 0) {
    let idx = filename.indexOf("%NOW");
    const now = new Date();
    const NOW = `${now.getFullYear()}${
        now.getMonth() + 1 < 10 ? "0" + now.getMonth() + 1 : now.getMonth() + 1
    }${now.getDate()}-${now.getHours()}${now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()}`;
    filename = `${filename.substring(0, idx)}${NOW}${filename.substring(idx + 4)}`;
}
console.log(`Using filename <${filename}>`);

getClient().then(client => {
    return uploadFile(client, filename, folderId)
}).catch(console.error);