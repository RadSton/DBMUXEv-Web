
module.exports = (app = require("express")(), configuration, dbmuxev) => {

    app.get("/api/v1/architectures", (req, res) => {
        res.send(dbmuxev.architectures);
    });

    app.get("/api/v1/architecture/:id", (req, res) => {

        const id = req.params.id;

        if (!id.includes(".")) {
            res.status(400).send({ error: "Invalid id-format" });
            return;
        }

        let idSplit = id.split(".");

        const arch = idSplit[0];
        const vari = idSplit[1];

        if (!dbmuxev.architectures[arch]) {
            res.status(400).send({ error: "Invalid architecture" });
            return;
        }

        const val = dbmuxev.architectures[arch][vari];

        if (!val) {
            res.status(400).send({ error: "Invalid architecture variation" });
            return;
        }

        res.send(val);
    });

    app.get("/api/v1/architectureList", (req, res) => {
        res.send(Object.keys(dbmuxev.networks));
    })

    app.post("/api/v1/architecture/search", (req, res) => {

        if (!req.body.query) {
            res.status(400).send("You need to declare query in the json body of the request!")
            return;
        }

        const query = req.body.query.toLowerCase();

        let results = {};

        // I dont wanna know how much time in this routine is spent on toLowerCase
        func1: for (const architectureKey in dbmuxev.architectures) {

            const architecture = dbmuxev.architectures[architectureKey];

            if (typeof architecture !== 'object')
                continue func1;

            results[architectureKey] = {};

            func2: for (const variantKey in architecture) {

                const fullName = architectureKey + "." + variantKey;
                const variant = architecture[variantKey];

                if (fullName.toLowerCase().includes(query)) {
                    results[architectureKey][variantKey] = variant;
                    continue func2;
                }

                if (variant.comment)
                    for (const language in variant.comment)
                        if (variant.comment[language].toLowerCase().includes(query)) {
                            results[architectureKey][variantKey] = variant;
                            continue func2;
                        }

                if (variant.protocols)
                    for (const protocol of variant.protocols)
                        if (protocol.toLowerCase().includes(query)) {
                            results[architectureKey][variantKey] = variant;
                            continue func2;
                        }
            }

            if (Object.keys(results[architectureKey]).length == 0)
                results[architectureKey] = undefined;

        }

        res.send(results);
    })
}