// This file contains a little suffering 
// Originaly wanted to base this on https://github.com/RadSton/PSA-RE/commit/247a8fa632d1fe00c7b4fc055f06930bf77090d0#diff-856037e48e5b11ecbda37a2786352dcf9f0ef3bc8252d676511e91d50eac6724R160-R170
// but I think only the reversing was "directly" copied
// it works thank god ; Update 2 weeks later: no it didnt, id*** radston12
// Update 6 days later: Yes it works for now but the function "bigEndian" does "LittleEndian", such an id*** radston12
// Fixed now


/**
 * This function converts the supplied bits to the big endian format by returning startBit and length
 * 
 * @param {"1.7-1.0"} bits "bits" string from signals
 * @returns {{length: 1, startBit: 10}}
 * @todo optimize dont convert to little endian just for length!
 */

module.exports.convertToBigEndian = (bits) => {
    if(bits.length == 1) bits = bits + ".0";

    let raw = bits.replaceAll(".", "").split("-");

    return {
        length: this.convertToLittleEndian(bits).length,
        startBit: convertToBigEndianLocation(Number.parseInt(raw[0]))
    }
}

/**
 * This function converts the supplied bits to the little endian format by returning startBit and length
 * 
 * @param {"1.7-1.0"} bits "bits" string from signals
 * @returns {{length: 1, startBit: 10}}
 */

module.exports.convertToLittleEndian = (bits) => {

    if(bits.length == 1) bits = bits + ".0";

    let raw = bits.replaceAll(".", "").split("-").map((x) => Number.parseInt(x)); // List of raw values without dot // f.e. "1.7-1.0" -> [7, 0] or "5.0" -> [32]
    let parsed = raw; // .map(convertToBigEndianLocation)

    let data = {
        length: 1,
        startBit: parsed[0]
    }

    if (parsed.length == 1)
        return data;

    // you probably call it bad code / avoiding the right solution but I call this a fix since it works!
    // I dont wanna redo all the complicated formulars just to work for bits above 8 bits of region
    // The formulars are a pain in the arse and just to make them usefull I spent 3 hours in geogebra and testing javascript soultions
    // This fix was thought of and made in less than ~ 10 minutes and not 3 hours so I see it as a win!
    if ((Math.floor(raw[1] / 10) - Math.floor(raw[0] / 10)) > 0) {
        let diff0 = raw[0] % 10;
        let diff1 = raw[1] % 10;

        if (diff0 != 0 && ((diff0 == 0 && diff1 == 7) || (diff0 == 7 && diff1 == 0))) {
            let newRaw = [];
            
            newRaw.push(raw[0] - diff0);
            newRaw.push(raw[1] + diff0);

            raw = newRaw;
            parsed = raw.map(convertToBigEndianLocation);
        }
    }

    if (yamlFormatFromBit(raw[0]) < yamlFormatFromBit(raw[1])) {
        data.startBit = parsed[0];
        data.length = parsed[1] - parsed[0];

        if ((parsed[1] - parsed[0]) < 0) {
            data.startBit = parsed[1];
            data.length = parsed[0] - parsed[1];
        }

    } else {

        data.startBit = parsed[1];
        data.length = parsed[0] - parsed[1];

        if ((parsed[0] - parsed[1]) < 0) {
            data.startBit = parsed[0];
            data.length = parsed[1] - parsed[0];
        }

    }

    data.length += 1;

    return data;
}

// Following 2 functions made with help of GeoGebra and a lot of brainpower
const yamlFormatFromBit = (x) => Math.floor(x / 10) * 8 - (x % 10) - 1

const convertToBigEndianLocation = (value) => {

    const yml = yamlFormatFromBit(value);
    const bitPositionModulo = (yml % 8);

    return (yml - bitPositionModulo) + (7 - bitPositionModulo);
}