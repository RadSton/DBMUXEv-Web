const fs = require("fs");
const path = require("path");

module.exports.load = (app, configuration, dbmuxev, dbmuxevLibrary) => {
    console.info("Trying to load all api endpoints");

    const OPTIONS_TO_EXPOSE = ["ENABLE_WEBSERVER", "ENABLE_API", "ENABLE_WEB_EDITING", "DISABLE_CONVERSION_ENDPOINTS"]

    let options = {};

    for(const key of OPTIONS_TO_EXPOSE) 
        options[key] = configuration[key];
    
    app.get("/api/config", (req, res) => {
        res.send(options);
    });

    fs.readdirSync(path.join(__dirname, "./"))
        .filter(name => !name.includes("."))
        .forEach(folder => {

            fs.readdirSync(path.join(__dirname, "./" + folder + "/"))
                .filter(name => name.endsWith(".js"))
                .forEach(jsFile => {

                    console.debug("Registering API-Endpoint-Definition-File " + `./${folder}/${jsFile}`);
                    const javascript = require(`./${folder}/${jsFile}`);
                    javascript(app, configuration, dbmuxev, dbmuxevLibrary);
                    
                })

        });

    console.info("Registered all api endpoints");
} 