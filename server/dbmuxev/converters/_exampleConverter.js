module.exports = {
    name: "DBC",
    fileExtention: 'dbc',

    /**
     * This function gets called with busInfo and mesages when converison is requested.
     * 
     * NOTE: The require(...) statements is there so that autocomplete knows how the object is built up
     * @returns {String} fileContents
     */
    convert: (busInfo = require("../../debugging_dbmuxev.json").networks["AEE2004.full"]["HS.IS"], messages = require("../../debugging_dbmuxev.json").buses["AEE2004.full"]["HS.IS"]) => {
        
    }
}