const fs = require("fs").promises;
const path = require("path");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const { createReadStream } = require("fs");
const commandLineUsage = require("command-line-usage");


const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly", "https://www.googleapis.com/auth/drive"];

const getPath = (usePath, defaultPath) => {
    let p = usePath || defaultPath;
    if (!p) throw Error(`Unable to find path to inspect - usePath <${usePath}> defaultPath <${defaultPath}>`);
    console.log(`Read path <${p}>`);
    if (p.indexOf("./") === 0) {
        p = path.join(__dirname, p.substring(2));
    } else if (p.indexOf("../") === 0) {
        p = path.join(__dirname, "..", p.substring(3));
    }
    console.log(`Using path <${p}>`);
    return p;
};

const getTokenPath = () => {
    return getPath(process.env.GOOGLE_TOKEN_PATH, "/settings/token.json");
};

const getCredentialsPath = () => {
    return getPath(process.env.GOOGLE_CREDENTIALS_PATH, "/settings/credentials.json");
};

 /**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
const loadSavedCredentialsIfExist = async () => {
    const p = getTokenPath();

    try {
        const content = await fs.readFile(p);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Returns a client for API calls using an existing token.
 *
 */
const getClient = async () => {
    console.log("Loading existing tokens");
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        console.log("Found tokens - returning client");
        return client;
    }
    throw Error("Unable to load tokens");
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const p = getCredentialsPath();
    const content = await fs.readFile(p);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(getTokenPath(), payload);
}

/**
 * Authenticates to Google and writes token.json
 *
 */
const authorize = async () => {
    const p = getCredentialsPath();
    const client = await authenticate({
        scopes: SCOPES,
        keyfilePath: p,
    });
    if (client.credentials) {
        console.log("Saving credentials");
        await saveCredentials(client);
        return client;
    } else {
        console.error("Unable to save credentials");
        throw Error("Unable to save credentials");
    }
}

function uploadFile(authClient, filename, parentFolderId) {
    const mimeType = "application/octet-stream";
    const p = path.parse(filename);
    const name = p.base;
    const requestBody = {
        name,
        mimeType,
    };
    if (parentFolderId) requestBody.parents = [parentFolderId];

    console.log(`Starting upload`);
    const drive = google.drive({ version: "v3", auth: authClient });
    drive.files
        .create({
            requestBody,
            media: {
                mimeType,
                body: createReadStream(filename),
            },
        })
        .then((res) => {
            console.log(`Uploaded <${filename}> to <${parentFolderId}>`);
            return p;
        });
}

const getDefaultCommandLineArguments = () => {
    const optionDefinitions = [
        { name: "help", type: Boolean, description: "Shows help" },
        { name: "verbose", type: Boolean, description: "Runs in verbose mode" }
    ];
    return optionDefinitions;
}

const getListCommandLineArguments = () => {
    const optionDefinitions = getDefaultCommandLineArguments();
    optionDefinitions.push({
        name: "folder-id",
        type: String,
        description: "Folder ID to upload file to if any",
    });
    return optionDefinitions;
}

const getDeleteCommandLineArguments = () => {
    const optionDefinitions = getDefaultCommandLineArguments();
    optionDefinitions.push({
        name: "id",
        type: String,
        description: "File ID to delete",
    });
    return optionDefinitions;
};

const getUploadCommandLineArguments = () => {
    const optionDefinitions = getDefaultCommandLineArguments();
    optionDefinitions.push({
        name: "folder-id",
        type: String,
        description: "Folder ID to upload file to if any"
    });
    optionDefinitions.push({
        name: "filename",
        type: String,
        description: "Path of the file to upload",
    });
    return optionDefinitions;
};

const printCommandLineUsage = (title, description, options) => {
    const sections = [
        {
            header: title,
            content: description
        },
        {
            header: 'Options',
            optionList: options
        }
    ]
    console.log(commandLineUsage(sections));
}

module.exports = {
    loadSavedCredentialsIfExist,
    getClient,
    authorize,
    getPath,
    uploadFile,
    getListCommandLineArguments,
    getUploadCommandLineArguments,
    getDeleteCommandLineArguments,
    printCommandLineUsage,
};