const path = require("path");
const fs = require("fs");
const yaml = require('js-yaml'); // to read (fast and easy)
const yawn = require("yawn-yaml"); // to write (uses js-yaml to read and preserves comments / styling on saving)

const converters = require("./converters");

/**
 * Smart just means that is gonna take more time because it thinks about what files it will load! 
 * (It accually looks at the architectures and only parses files that are used within eachother at least for the most part)
 * @param configuarion Configuration file configuration.json in ./web/
 * @todo Implement diag stuff when there is need for that
 */
module.exports.loadSmart = (configuarion) => {
   const basePath = path.join(__dirname, "../../", configuarion.ROOT_DBMUXEV);

   console.info("Trying to load dbmuxev in " + basePath);

   let timeStarted = Date.now();

   let dbmuxev = {
      architectures: {},
      cars: {},
      nodes: {},
      buses: {},
      diag: {},

      // Nearly same keys as in buses but Not in spec and different data; allows for simpler use I think .. I hope
      networks: {}
   }

   dbmuxev.architectures = yaml.load(fs.readFileSync(path.join(basePath, './architectures.yml'), 'utf8'));

   console.debug("Loaded " + Object.keys(dbmuxev.architectures).length + " architectures from architectures.yml");

   for (const carFile of fs.readdirSync(path.join(basePath, './cars'))) {
      if (carFile.endsWith(".yml")) {
         try {
            dbmuxev.cars[carFile.replaceAll(".yml", "")] = yaml.load(fs.readFileSync(path.join(basePath, './cars/' + carFile), 'utf8'));
         } catch (error) {
            console.error("Failed loading car " + carFile + ": " + error.reason + "!")
            console.log(error);
         }
      }
   }

   console.debug("Loaded " + Object.keys(dbmuxev.cars).length + " cars files from cars/*.yml");

   let inFolder = fs.readdirSync(path.join(basePath, './nodes'));
   let inArchitectures = [];

   for (const parentArchitecture of Object.keys(dbmuxev.architectures))
      for (const children of Object.keys(dbmuxev.architectures[parentArchitecture]))
         inArchitectures.push(parentArchitecture + "." + children);


   for (const expectedNode of inArchitectures) {
      if (!fs.existsSync(path.join(basePath, './nodes/' + expectedNode + '.yml'))) {
         console.warn("Node " + expectedNode + " declared in architectures but file " + './nodes/' + expectedNode + '.yml' + " doesnt exist!")
         continue;
      }

      dbmuxev.nodes[expectedNode] = yaml.load(fs.readFileSync(path.join(basePath, './nodes/' + expectedNode + '.yml'), 'utf8'));

      inFolder.splice(inFolder.indexOf(expectedNode + ".yml"), 1);

      console.debug("Loaded " + Object.keys(dbmuxev.nodes[expectedNode]).length + " nodes from " + expectedNode);
   }

   if (inFolder.length >= 1)
      for (const unreadNode of inFolder)
         if (unreadNode.endsWith(".yml"))
            console.warn("Node " + unreadNode + " was skipped because it isnt declared in architectures.yml")

   console.debug("Loaded " + Object.keys(dbmuxev.nodes).length + " node-files from nodes/*.yml");

   let networkCounter = 0;
   for (const architecture of Object.keys(dbmuxev.architectures)) { // e.g. AEE2001 AEE2004
      for (const architectureType of Object.keys(dbmuxev.architectures[architecture])) { // e.g. full, eco, ev

         const architectureFullName = architecture + "." + architectureType;
         const architectureObject = dbmuxev.architectures[architecture][architectureType];

         if (typeof architectureObject !== 'object') {
            console.warn("Tried to interprete architecture $magenta" + architecture + "." + architectureType + "$yellow expected object but got $magenta<" + (typeof architectureObject) + ">: " + JSON.stringify(architectureObject));
            continue;
         }

         if (!architectureObject.networks) {
            console.warn("Tried to interprete architecture $magenta" + architecture + "." + architectureType + "$yellow expected $magenta\"networks\"$yellow field!");
            continue;
         }

         dbmuxev.networks[architectureFullName] = {};

         for (const networkType of Object.keys(architectureObject.networks)) {
            for (const networkName of Object.keys(architectureObject.networks[networkType])) {

               const networkFullName = networkType + "." + networkName;

               dbmuxev.networks[architectureFullName][networkFullName] = architectureObject.networks[networkType][networkName];

               networkCounter++;
            }
         }

      }
   }

   console.debug("Found " + networkCounter + " networks/buses from architectures.yml");

   for (const architectureKey of Object.keys(dbmuxev.networks)) {

      const architecture = dbmuxev.networks[architectureKey];

      let networkBasePath = path.join(basePath, "./buses/" + architectureKey);

      if (!fs.existsSync(networkBasePath)) {
         console.warn("Failed to load bus-content for $magenta" + architectureKey + "$yellow since there is no folder for it in ./buses/")
         continue;
      }

      dbmuxev.buses[architectureKey] = {};

      for (const networkFullName of Object.keys(architecture)) {
         let networkPath = path.join(networkBasePath, "./" + networkFullName);

         if (!fs.existsSync(networkPath)) {
            console.warn(`Failed to load network $magenta${networkFullName}$yellow for $magenta${architectureKey}$yellow since there is no folder for it in ./buses/${architectureKey}/`)
            continue;
         }

         dbmuxev.buses[architectureKey][networkFullName] = {};

         for (const busMessageFile of fs.readdirSync(networkPath)) {
            if (busMessageFile.endsWith(".yml")) {

               try {

                  dbmuxev.buses[architectureKey][networkFullName][busMessageFile.replaceAll(".yml", "")] = yaml.load(fs.readFileSync(path.join(networkPath, './' + busMessageFile), 'utf8'));

               } catch (error) {

                  console.error("Failed loading message " + path.join(networkPath, './' + busMessageFile) + ": " + error.reason + "!")

               }

            } else if(busMessageFile == "_DISCLAIMER.txt") {
               dbmuxev.networks[architectureKey][networkFullName].disclaimer = fs.readFileSync(path.join(networkPath, './' + busMessageFile), 'utf8');
            }
         }

      }
   }
   if (configuarion.SAVE_DEBBUGING_DBMUXEV_FILE)
      fs.writeFileSync(path.join(basePath, './web/debugging_dbmuxev.json'), JSON.stringify(dbmuxev));

   if (!configuarion.DISABLE_CONVERSION_ENDPOINTS)
      converters.load();

   let timeTook = Date.now() - timeStarted;

   console.info("Loaded dbmuxev in " + timeTook + "ms");

   return dbmuxev;
}

module.exports.runConverter = converters.convert;
module.exports.getAvailableConverters = converters.availableConverters;
