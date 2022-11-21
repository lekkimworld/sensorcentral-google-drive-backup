const fs = require("fs").promises;
const path = require("path");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");

const SCOPES = ["https://www.googleapis.com/auth/drive.metadata.readonly", "https://www.googleapis.com/auth/drive"];

const getParentFolderId = () => {
    const PARENT_FOLDER = process.env.GOOGLE_DRIVE_PARENT_FOLDERID;
    console.log(`Using Google Drive folder ID <${PARENT_FOLDER}>`);
    return PARENT_FOLDER;
}

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
    return getPath(process.env.TOKEN_PATH, "/settings/token.json");
};

const getCredentialsPath = () => {
    return getPath(process.env.CREDENTIALS_PATH, "/settings/credentials.json");
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

module.exports = {
    loadSavedCredentialsIfExist,
    getClient,
    authorize,
    getParentFolderId,
    getPath
};