
module.exports = (app = require("express")(), configuration, dbmuxev = require("../../debugging_dbmuxev.json")) => {
    
    app.get("/api/v1/buses", (req, res) => {
        res.send(dbmuxev.buses);
    });

    app.get("/api/v1/networks", (req, res) => {
        res.send(dbmuxev.networks);
    })

    app.post("/api/v1/buses/search", (req, res) => {
        
        if (!req.body.query) {
            res.status(400).send("You need to declare query in the json body of the request!")
            return;
        }

        if (!req.body.arch) {
            res.status(400).send("You need to declare arch in the json body of the request!")
            return;
        }

        if (!req.body.identifyer) {
            res.status(400).send("You need to declare identifyer in the json body of the request!")
            return;
        }

        const query = req.body.query.replaceAll(" ", "").toUpperCase();
        const arch = req.body.arch;
        const identifyer = req.body.identifyer;

        if (!dbmuxev.buses[arch]) {
            res.status(404).send("There is no network/bus documentation for an architecture called \"" + arch + "\"!")
            return;
        }

        if (!dbmuxev.buses[arch][identifyer]) {
            res.status(404).send("There is no network/bus documentation for \"" + identifyer + "\" in \"" + arch + "\"!")
            return;
        }

        const bus = dbmuxev.buses[arch][identifyer]; 

        let results = {};

        func1: for (const messageId in bus) {

            const message = bus[messageId];

            if (("0X" + messageId).includes(query)) {
                results[messageId] = message;
                continue func1;
            }

            if (typeof message !== 'object')
                continue func1;

            if (message.name.replaceAll(" ", "").includes(query)) {
                results[messageId] = message;
                continue func1;
            }

            if (message.alt_names)
                for (const altName of message.alt_names)
                    if (altName.replaceAll(" ", "").includes(query)) {
                        results[messageId] = message;
                        continue func1;
                    }

            if (message.comment)
                for (const language in message.comment)
                    if (message.comment[language] && message.comment[language].replaceAll(" ", "").toUpperCase().includes(query)) {
                        results[messageId] = message;
                        continue func1;
                    }

            if (message.senders)
                for (const sender of message.senders)
                    if (sender.includes(query)) {
                        results[messageId] = message;
                        continue func1;
                    }

            if (message.receivers)
                for (const receiver of message.receivers)
                    if (receiver.includes(query)) {
                        results[messageId] = message;
                        continue func1;
                    }

            if (message.signals)
                for (const signal in message.signals)
                    if (signal.includes(query)) {
                        results[messageId] = message;
                        continue func1;
                    }

        }

        res.send(results);
    })
}