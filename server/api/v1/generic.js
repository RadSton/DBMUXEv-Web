const languagesJSON = require("./../../../resources/languages.json");
module.exports = (app = require("express")(), configuration, dbmuxev) => {


    let languagesObject = {};
    for(const langCode of dbmuxev.languages) 
        languagesObject[langCode] = languagesJSON[langCode];
    

    app.get("/api/v1/languages", (req, res) => {
        res.send(languagesObject);
    });

}