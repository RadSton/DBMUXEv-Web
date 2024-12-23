const bitHelper = require("../bitHelper");

module.exports = {
    name: "DBC",
    fileExtention: 'dbc',

    /**
     * This function takes in a dbmuxev and spits out a .dbc file in text form
     * 
     * NOTE: The require(...) statements is there so that autocomplete knows how the object is built up
     * @returns {String} fileContents
     */
    convert: (dbmuxev, arch, bus, lang) => {

        if (!dbmuxev.networks[arch])
            return { error: "Invalid architecture" }

        const busInfo = dbmuxev.networks[arch][bus];

        if (!busInfo)
            return { error: "Invalid bus" }

        const messages = dbmuxev.buses[arch][bus];
        const nodes = dbmuxev.nodes[arch]

        /*
        Implemented after:
        https://github.com/stefanhoelzl/CANpy/blob/master/docs/DBC_Specification.md
        and 
        https://github.com/RadSton/PSA-RE/tree/179da2b707fe6923c1d2b91622a96b1eba7a49d2/psa-db-tool/src
        */
        let DBC = `VERSION ""\n\nNS_ : \n	NS_DESC_\n	CM_\n	BA_DEF_\n	BA_\n	VAL_\n	CAT_DEF_\n	CAT_\n	FILTER\n	BA_DEF_DEF_\n	EV_DATA_\n	ENVVAR_DATA_\n	SGTYPE_\n	SGTYPE_VAL_\n	BA_DEF_SGTYPE_\n	BA_SGTYPE_\n	SIG_TYPE_REF_\n	VAL_TABLE_\n	SIG_GROUP_\n	SIG_VALTYPE_\n	SIGTYPE_VALTYPE_\n	BO_TX_BU_\n	BA_DEF_REL_\n	BA_REL_\n	BA_DEF_DEF_REL_\n	BU_SG_REL_\n	BU_EV_REL_\n	BU_BO_REL_\n	SG_MUL_VAL_`

        DBC += "\nBS_: " + (busInfo.bitrate != undefined ? busInfo.bitrate : "")

        const nodeList = ["UNKNOWN"];

        let comments = "";
        let values = "";

        for (const [nodeName, nodeData] of Object.entries(nodes)) {

            if (nodeData.bus && nodeData.bus.includes(bus)) {
                nodeList.push(nodeName.replaceAll(" ", "_"));

                if (nodeData.name && nodeData.name[lang])
                    comments += "CM_ BU_ " + nodeName.replaceAll(" ", "_") + " \"" + nodeData.name[lang] + "\";\n";

            }
        }

        DBC += "\n\nBU_: " + nodeList.join(" ") + " \n";

        for (const [messageId, message] of Object.entries(messages)) {

            const nodes = (message.senders && message.senders.length > 0) ? message.senders[0] : "UNKNOWN";
            const reciver = (message.receivers && message.receivers.length > 0) ? message.receivers.join(",") : "UNKNOWN";


            DBC += `\nBO_ ${message.id} ${message.name}: ${message.length} ${nodes}`;

            if (message.comment && message.comment[lang])
                comments += `CM_ BO_ ${message.id} \"${message.comment[lang]}\";\n`;

            if (message.signals)
                for (let [signalName, signal] of Object.entries(message.signals)) {

                    if (!signal.bits) {
                        console.warn("[DBC] Had to skip data because signal.bits definition of $magenta" + signalName + "$yellow was missing in $magenta0x" + messageId)
                        continue;
                    }

                    if(signalName.includes(" ")) {
                        console.warn("[DBC] Had to automaticly fix data because signal $magenta" + signalName + "$yellow in $magenta0x" + messageId + "$yellow because its name contains a space and this is causes the dbc to be invalid")
                        signalName = signalName.replaceAll(" ", "_")
                    }

                    if (signalName.match(/^\d/)) {
                        console.warn("[DBC] Had to skip data because signal $magenta" + signalName + "$yellow in $magenta0x" + messageId + "$yellow because its name starts with a number and this is causes errors with many dbc viewer programs")
                        continue;
                    }

                    const { length, startBit } = bitHelper.convertToBigEndian(signal.bits)

                    let unsigned = true;

                    if (signal.signed)
                        unsigned = false

                    const factor = signal.factor != undefined ? signal.factor : 1;
                    const offset = signal.offset != undefined ? signal.offset : 0;
                    const min = signal.min != undefined ? signal.min : 0;
                    const max = signal.max != undefined ? signal.max : 0;

                    let units = signal.units != undefined ? signal.units : "";

                    // TODO: DO NOT HARD CODE ENDIAN
                    // @<ENDIAN>  
                    // ENDIAN : 0 -> big 1 -> little 
                    DBC += `\n SG_ ${signalName} : ${startBit}|${length}@0${unsigned ? "+" : "-"} (${factor},${offset}) [${min}|${max}] \"${units}\" ${reciver}`

                    if (signal.comment && signal.comment[lang])
                        comments += `CM_ SG_ ${message.id} ${signalName} \"${signal.comment[lang]}\";\n`;

                    if (!signal.values) continue;

                    let VAL_string = "";

                    for (const [val, valueData] of Object.entries(signal.values)) {
                        VAL_string += `${val} \"${valueData[lang]}\" `;
                    }

                    values += `VAL_ ${message.id} ${signalName} ${VAL_string};\n`;
                }

            DBC += "\n";
        }

        DBC += "\n" + comments;
        DBC += "\n" + values;

        return DBC;
    }
}