const fs = require("fs");
const path = require("path")

const converters = {};

module.exports.load = () => {
    console.info("Trying to register all dbmuxev converters");

    fs.readdirSync(path.join(__dirname, "./converters"))
        .filter(name => name.includes(".js") && !name.includes("_"))
        .forEach(jsFile => {
           
            console.debug("Registering dbmuxev converter " + `./converters/${jsFile}`);
            const javascript = require(`./converters/${jsFile}`);

            if (!javascript || !javascript.name || !javascript.convert || !javascript.fileExtention) {
                console.error("Failed to register converter: $magenta" + jsFile);
                return;
            }
            converters[javascript.name] = javascript;
            console.debug("Registered dbmuxev converter $cyan" + javascript.name + "$magenta for $cyan." + javascript.fileExtention + "$magenta-files!");
        
        });


    console.info("Registered all dbmuxev converters");
}


module.exports.availableConverters = () => {
    return Object.keys(converters);
}

module.exports.convert = (dbmuxev, converter, architecture, bus, language) => {
    if (!dbmuxev || !converter || !architecture || !bus || !language)
        return { error: "Missing parameters" }


    if (!converters[converter])
        return { error: "Invalid converter" }

    try {
        const result = converters[converter].convert(dbmuxev, architecture, bus, language);

        if (result.error) 
            return { error: result.error };
        
        return { file: result, extention: converters[converter].fileExtention }

    } catch (e) {

        console.error("Failed to run converter " + converters[converter].name + ": ");
        console.log(e);

        return { error: "Internal Server Error: Failed to run converter!" }
    }
}