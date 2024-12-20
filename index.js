const configuarion = require("./configuration.json");

require("./server/utils/BetterLogging")({
    colorEnabled: configuarion.ENABLE_COLOR_LOGGING,
    prefix: "$gray[$light_redDBMUXEv-Web$gray]"
});

if (configuarion.ENABLE_DBMUXEV_PARSING) {
    global.dbmuxevLibrary = require("./server/dbmuxev/dbmuxev");
    global.dbmuxev = dbmuxevLibrary.loadSmart(configuarion);
}

if (!configuarion.ENABLE_WEBSERVER) {
    console.warn("$redSince config option $magentaENABLE_WEBSERVER$red is false the program will now exit after parsing the dbmuxev database!")
    return;
}
const express = require("express");
const { networkInterfaces } = require('os');

const app = express();

if (configuarion.ENABLE_WEB_UI)
    app.use(express.static(configuarion.STATIC_WEB_ROOT))

app.use(express.json());

if (configuarion.ENABLE_API && configuarion.ENABLE_DBMUXEV_PARSING)
    require("./server/api/APILoader").load(app, configuarion, dbmuxev, dbmuxevLibrary);

// Single Page Application

if (configuarion.ENABLE_WEB_UI)
    app.get("/*", (_, res) => {
        res.sendFile(__dirname + "/" + configuarion.STATIC_WEB_ROOT + "/index.html");
    })

app.listen(configuarion.WEB_PORT, () => {
    console.debug("Webserver running on port " + configuarion.WEB_PORT);
    console.log();
    console.info("$redPSA-RE-Web`s Webserver$light_magenta has started, you can access it at one of these addresses:");
    console.info("$yellowLocal$green access: $bluehttp://localhost:" + configuarion.WEB_PORT);
    
    try {
        // Stolen and modified code from: https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    console.info("$yellowOther$green access: $light_cyanhttp://" + net.address + ":" + configuarion.WEB_PORT + " (" + name + ")");
                }
            }
        }

        console.log();
    } catch (e) { }
})