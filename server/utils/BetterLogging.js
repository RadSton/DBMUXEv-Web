/*    Better Logging!   */ 
/*   made by radston12  */ 
/*     updated  2024    */ 
/*   bad code reserved  */

let defaultSettings = {
    colorEnabled: true,
    defaultColor: "$white$bg_black", /* white on black background */
    defaultColorLookUp: "$reset",
    colorPallet: [
        /* Using ANSI codes to change color: https://en.wikipedia.org/wiki/ANSI_escape_code#Colors */
        { lookUp: '$black',                 colorANSI: "\x1b[30m"  }, // black
        { lookUp: '$red',                   colorANSI: "\x1b[31m"  }, // red
        { lookUp: '$green',                 colorANSI: "\x1b[32m"  }, // green
        { lookUp: '$yellow',                colorANSI: "\x1b[33m"  }, // yellow
        { lookUp: '$blue',                  colorANSI: "\x1b[34m"  }, // blue
        { lookUp: '$magenta',               colorANSI: "\x1b[35m"  }, // magenta
        { lookUp: '$cyan',                  colorANSI: "\x1b[36m"  }, // cyan
        { lookUp: '$white',                 colorANSI: "\x1b[37m"  }, // white
        { lookUp: '$gray',                  colorANSI: "\x1b[90m"  }, // gray
        { lookUp: '$light_red',             colorANSI: "\x1b[91m"  }, // light red
        { lookUp: '$light_green',           colorANSI: "\x1b[92m"  }, // light green
        { lookUp: '$light_yellow',          colorANSI: "\x1b[93m"  }, // light yellow
        { lookUp: '$light_blue',            colorANSI: "\x1b[94m"  }, // light blue
        { lookUp: '$light_magenta',         colorANSI: "\x1b[95m"  }, // light magenta
        { lookUp: '$light_cyan',            colorANSI: "\x1b[96m"  }, // light cyan
        { lookUp: '$light_white',           colorANSI: "\x1b[97m"  }, // light white
        /* Background */
        { lookUp: '$bg_black',              colorANSI: "\x1b[40m"  }, // black background
        { lookUp: '$bg_red',                colorANSI: "\x1b[41m"  }, // red background
        { lookUp: '$bg_green',              colorANSI: "\x1b[42m"  }, // green background
        { lookUp: '$bg_yellow',             colorANSI: "\x1b[43m"  }, // yellow background
        { lookUp: '$bg_blue',               colorANSI: "\x1b[44m"  }, // blue background
        { lookUp: '$bg_magenta',            colorANSI: "\x1b[45m"  }, // magenta background
        { lookUp: '$bg_cyan',               colorANSI: "\x1b[46m"  }, // cyan background
        { lookUp: '$bg_white',              colorANSI: "\x1b[47m"  }, // white background
        { lookUp: '$bg_gray',               colorANSI: "\x1b[100m" }, // gray background
        { lookUp: '$bg_light_red',          colorANSI: "\x1b[101m" }, // light red background
        { lookUp: '$bg_light_green',        colorANSI: "\x1b[102m" }, // light green background
        { lookUp: '$bg_light_yellow',       colorANSI: "\x1b[103m" }, // light yellow background
        { lookUp: '$bg_light_blue',         colorANSI: "\x1b[104m" }, // light blue background
        { lookUp: '$bg_light_magenta',      colorANSI: "\x1b[105m" }, // light magenta background
        { lookUp: '$bg_light_cyan',         colorANSI: "\x1b[106m" }, // light cyan background
        { lookUp: '$bg_light_white',        colorANSI: "\x1b[107m" }  // light white background
    ],
    prefix: "",
    loggingPrefix: {
        debug: "$gray[$magentaDEBUG$gray] ",
        info:  "$gray[$greenINFO $gray] ",
        warn:  "$gray[$yellowWARN $gray] ",
        error: "$gray[$redERROR$gray] ",
    },
    loggingColors: {
        debug: "$magenta",
        info:  "$green",
        warn:  "$yellow",
        error: "$red",
    },
    onLog: (str) => {}
}

module.exports = (settings) => {
    const userSettings = preCalculateColors({
        ...defaultSettings,
        ...settings, 
    });

    console.debug = (str) => BetterLogging(str, "debug", userSettings);
    console.info  = (str) => BetterLogging(str, "info",  userSettings);
    console.warn  = (str) => BetterLogging(str, "warn",  userSettings);
    console.error = (str) => BetterLogging(str, "error", userSettings);
};


/**
 * Takes the string and logging type and logs it into the console
 * 
 * @param {String} string 
 * @param {String} type 
 * @param {defaultSettings} settings 
 */
const BetterLogging = (string, type, settings) => {
    string = applyColorToString(string, settings);

    const finalString = settings.prefix + settings.loggingPrefix[type] + settings.loggingColors[type] + string + settings.defaultColor;

    settings.onLog(finalString);
    
    console.log(finalString);
}

/**
 * Applies colorpallete settings to a string
 * 
 * @param {String} string 
 * @param {defaultSettings} settings 
 * @returns 
 */
const applyColorToString = (string, settings) => {
    for(const { lookUp, colorANSI } of settings.colorPallet) 
        string = string.replaceAll(lookUp, colorANSI);

    return string;
}

/**
 * Pre bakes the color for prefix, default color, logging prefixies and logging colors to achieve faster printing !
 *
 * @param {defaultSettings} settings 
 */
const preCalculateColors = (settings) => {
    /* Replace all the color codes with nothing to disable color */
    if(!settings.colorEnabled) 
        for (let index = 0; index < settings.colorPallet.length; index++) 
            settings.colorPallet[index].colorANSI = "";

    settings.defaultColor = applyColorToString(settings.defaultColor, settings);

    settings.colorPallet.push({ lookUp: settings.defaultColorLookUp, colorANSI: settings.defaultColor })

    settings.prefix       = applyColorToString(settings.prefix,       settings);
    
    for(const index in settings.loggingColors) 
        settings.loggingColors[index] = applyColorToString(settings.loggingColors[index], settings);
    
    for(const index in settings.loggingPrefix) 
        settings.loggingPrefix[index] = applyColorToString(settings.loggingPrefix[index], settings);
        
    return settings;
}