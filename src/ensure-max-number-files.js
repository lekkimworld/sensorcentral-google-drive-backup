require("dotenv").config();
const { google } = require("googleapis");
const { getClient, getMaxNumberfilesCommandLineArguments, printCommandLineUsage, listFiles, deleteFileId } = require("./common");
const commandLineArgs = require("command-line-args");

const optionDefinitions = getMaxNumberfilesCommandLineArguments();
const options = commandLineArgs(optionDefinitions);
if (options.help) return printCommandLineUsage("Ensure Maximum number of Files", "Ensure the supplied folder in Google Drive has a maximum number of files", optionDefinitions);
let folderId = options["folder-id"];
if (!folderId) {
    folderId = process.env.GOOGLE_DRIVE_PARENT_FOLDERID;
    console.log(`No folder-id specified - read <${folderId}> from environment`);
}
const max_num_files = options["maximum-number-files"];
if (!max_num_files) {
    console.log(`No maximum-number-files specified - aborting...`);
}

getClient().then(client => {
    return Promise.all([Promise.resolve(client), listFiles(client, folderId)]);
}).then(data => {
    const client = data[0];
    const files = data[1];
    console.log(`Found <${files.length}> files in folder <${folderId}>`);
    if (files.length <= max_num_files) {
        console.log(`Less or equal number of files (${files.length}) than max <${max_num_files}> - nothing to do`);
        process.exit(0);
    } else {
        const promises = [];
        for (let i=0; i<files.length-max_num_files; i++) {
            const file = files[i];
            console.log(`Starting delete of <${file.name}> / <${file.id}>`);
            promises.push(deleteFileId(client, file.id));
        }
        return Promise.all(promises);
    }
}).then(data => {
    console.log("Done");
}).catch(console.error);
