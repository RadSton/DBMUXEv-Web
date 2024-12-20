
module.exports = (app = require("express")(), configuration, dbmuxev = require("../../debugging_dbmuxev.json")) => {
    app.get("/api/v1/nodes", (req, res) => {
        res.send(Object.keys(dbmuxev.nodes));
    });

    app.get("/api/v1/nodes/:id", (req, res) => {

        const archId = req.params.id;
        const node = dbmuxev.nodes[archId];

        if (!node) {
            res.status(400).send({ error: "Could not find any nodes for " + archId })
        }

        res.send(node);
    });

    app.post("/api/v1/node/:id/findByAlt", (req, res) => {

        if (!req.body.nodeName) {
            res.status(400).send({ error: "You need to declare nodeName in the body of the request!" })
            return;
        }

        const nodes = dbmuxev.nodes[req.params.id]

        if (!nodes) {
            res.status(400).send({ error: "Invalid arch!" })
            return;
        }

        const nodeName = req.body.nodeName;

        for (const [nodeKey, nodeData] of Object.entries(nodes)) {
            if (!nodeData.alt)
                continue;

            for (const altNames of nodeData.alt) {
                if (!altNames.includes(nodeName)) continue;

                let obj = {};

                obj[nodeKey] = {
                    redirectedFrom: nodeName,
                    ...nodeData
                };

                res.send(obj);

                return;
            }
        }

        res.send({ error: "No node was found" });

    })

    app.post("/api/v1/node/:id/search", (req, res) => {

        if (!req.body.query) {
            res.status(400).send({ error: "You need to declare query in the body of the request!" })
            return;
        }

        const node = dbmuxev.nodes[req.params.id];

        if (!node) {
            res.status(400).send({ error: "Invalid node!" })
            return;
        }

        const query = req.body.query.toUpperCase();

        let results = {};

        func1: for (const [nodeKey, nodeData] of Object.entries(node)) {
            
            if (nodeKey.includes(query)) {
                results[nodeKey] = nodeData;
                continue func1;
            }

            if (nodeData.alt)
                for (const altNames of nodeData.alt)
                    if (altNames.includes(query)) {
                        results[nodeKey] = nodeData;
                        continue func1;
                    }

            if (nodeData.bus)
                for (const bus of nodeData.bus)
                    if (bus.includes(query)) {
                        results[nodeKey] = nodeData;
                        continue func1;
                    }

            if (nodeData.name)
                if (nodeData.name.en.toUpperCase().includes(query) || nodeData.name.fr.toUpperCase().includes(query)) {
                    results[nodeKey] = nodeData;
                    continue func1;
                }

            if (nodeData.comment)
                if (nodeData.comment.en.toUpperCase().includes(query) || nodeData.comment.fr.toUpperCase().includes(query)) {
                    results[nodeKey] = nodeData;
                    continue func1;
                }

        }

        res.send(results);

    })

    app.post("/api/v1/node/:id/findMessages", (req, res) => {
        
        if (!req.body.nodeName) {
            res.status(400).send({ error: "You need to declare nodeName in the body of the request!" })
            return;
        }

        const arch = req.params.id;
        const nodeName = req.body.nodeName;

        if (!dbmuxev.nodes[arch]) {
            res.status(400).send({ error: "Could not find arch called \"" + arch + "\"!" });
            return;
        }

        if (!dbmuxev.nodes[arch][nodeName]) {
            res.status(400).send({ error: "Could not find node called \"" + nodeName + "\"!" });
            return;
        }

        if (!dbmuxev.buses[arch]) {
            res.status(400).send({ error: "There is no buses documentation for \"" + arch + "\" (yet)!" });
            return;
        }

        let namesToSearch = [];

        namesToSearch.push(nodeName);

        const fullNode = dbmuxev.nodes[arch][nodeName];

        if (fullNode.alt)
            for (const name of fullNode.alt)
                namesToSearch.push(name);

        const buses = dbmuxev.buses[arch];

        let response = { sending: {}, recieving: {} };

        for (const [bus, messages] of Object.entries(buses)) {

            response.sending[bus] = {};
            response.recieving[bus] = {};

            for (const [messageId, message] of Object.entries(messages)) {
                
                if (message.senders)
                    for (const sender of message.senders)
                        if (namesToSearch.includes(sender))
                            response.sending[bus][messageId] = message;

                if (message.receivers)
                    for (const receiver of message.receivers)
                        if (namesToSearch.includes(receiver))
                            response.recieving[bus][messageId] = message;
            }

            if (Object.keys(response.sending[bus]).length == 0)
                response.sending[bus] = undefined;
            
            if (Object.keys(response.recieving[bus]).length == 0)
                response.recieving[bus] = undefined;
        }

        res.send(response);

    })
}