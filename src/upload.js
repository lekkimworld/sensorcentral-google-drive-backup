require("dotenv").config();
const {getClient, getParentFolderId, getPath} = require("./common");
const path = require("path");
const { google } = require("googleapis");
const { createReadStream } = require("fs");

// read arguments from the command line
if (process.argv.length < 3) {
    console.log("Unable to read params from command line")
    return process.exit(1);
}
let filename = getPath(process.argv[2]);
console.log(`Read filename <${filename}>`);
if (filename.indexOf("%TODAY") >= 0) {
    let idx = filename.indexOf("%TODAY");
    const now = new Date();
    const TODAY = `${now.getFullYear()}${now.getMonth()+1 < 10 ? "0" + now.getMonth()+1 : now.getMonth()+1}${now.getDate()}`;
    filename = `${filename.substring(0, idx)}${TODAY}${filename.substring(idx+6)}`;
}
console.log(`Using filename <${filename}>`);
let parentFolderId = undefined;
if (process.argv.length > 3) {
    parentFolderId = process.argv[3];
} else {
    parentFolderId = getParentFolderId();
}
console.log(`Using parent folder ID <${parentFolderId}>`);

function uploadFile(authClient, filename, parentFolderId) {
    const mimeType = "application/octet-stream";
    const p = path.parse(filename);
    const name = p.base;
    const requestBody = {
        name,
        mimeType
    }
    if (parentFolderId) requestBody.parents = [parentFolderId];

    console.log(`Starting upload`);
    const drive = google.drive({ version: "v3", auth: authClient });
    drive.files.create({
        requestBody,
        media: {
            mimeType,
            body: createReadStream(filename),
        },
    }).then(res => {
        console.log(`Uploaded <${filename}> to <${parentFolderId}>`);
        return p;
    })
}

getClient().then(client => {
    return uploadFile(client, filename, parentFolderId)
}).catch(console.error);