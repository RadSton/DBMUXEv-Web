import Shared from "./Shared.js"

export default class Nodes extends Shared {
    constructor() {
        super()
        this.setTitle("Nodes");
        this.setActiveLink("/nodes");
    }

    renderArchSelector(nodesList) {
        this.setRenderingDetails(`Select Architecture ${this.generateLanguageSwitcher()}`);
        this.setInfoActive(false);

        let result = "<h5 style=\"text-align: center;\">You need to select an architecture beforehand</h5>";

        for (const node of nodesList) {
            const res = node.split(".");

            result += this.generateArchElement(node, "For cars after " + res[0].replaceAll("AEE", ""), "Architecture: " + res[0], "Variant: " + res[1]);
        }

        this.searchList.innerHTML = result;
    }

    renderNodeSelector(nodeContainer, nodeArch) {
        this.setInfoActive(false)
        this.setRenderingDetails(`Select a node from ${nodeArch} (${Object.keys(nodeContainer).length}) ${this.generateLanguageSwitcher()}`);

        if (nodeContainer.error) {
            this.searchList.innerHTML =
                `<div style="display: block; text-align: center;">
                    <h1>Failed to load nodes:</h1> 
                    <h5>${nodeContainer.error}</h5>
                    <span class="selTitle"><a class="headerLink selected" href="/nodes">Reset filters</a></span>
                </div>`;
            return;
        }

        let result = "";

        for (const [nodeKey, node] of Object.entries(nodeContainer)) {

            let name = node.name ? "Name: " + node.name[this.defaultLang] : "";
            let altName = node.alt ? "Alternative names: " + node.alt.join(", ") : "";
            let comment = node.comment ? "Comment: " + node.comment[this.defaultLang] : "";

            result += this.generateNodeElement(nodeKey, name, altName, comment);
        }

        this.searchList.innerHTML = result;
    }

    async renderNodeInfo(nodeContainer, nodeId, nodeArch) {
        let node = nodeContainer[nodeId];

        this.setInfoActive(true);
        this.setRenderingDetails("");

        if (!node) {
            const nodeByAlt = await requestJSONWithBody("POST", "/api/v1/node/" + nodeArch + "/findByAlt", {
                nodeName: nodeId
            })

            if (!nodeByAlt.error) {
                const [newKey, newNode] = Object.entries(nodeByAlt)[0]
                node = newNode;
                nodeId = newKey;
            }
        }

        if (!node) {
            this.selectedInfo.innerHTML = `
                <span class="selTitle">The node <span class="selType">${nodeId}</span> wasnt found in  <span class="selType">${nodeArch}</span></span>
                <span class="selTitle"><a class="headerLink selected" href="/nodes">Reset filters</a></span>
            `;
            return;
        }

        this.setRenderingDetails(`Showing node ${nodeId} from ${nodeArch} ${this.generateLanguageSwitcher()}`);

        this.selectedInfo.innerHTML = `<span class="selTitle">nodes/<span class="selType">${nodeArch}</span>.yml -> <span class="selType">${nodeId}</span></span>`;

        if (node.redirectedFrom)
            this.selectedInfo.innerHTML += `<span class="field" style="text-align: center; padding-bottom: 1vh;">Redirected from <span class="selType">${node.redirectedFrom}</span> to <span class="selType">${nodeId}</span></span>`;

        if (node.name)
            this.addField("Name: ", node.name[this.defaultLang])

        if (node.alt)
            this.addField("Alternative node names: ", node.alt.join(", "));

        if (node.comment)
            this.addField("Comment: ", node.comment[this.defaultLang]);

        if (node.bus && node.bus.length > 0)
            this.selectedInfo.innerHTML += `<span class="fieldTitle">Busses:</span>`;

        for (const bus of node.bus) {
            const splitName = bus.split(".");
            const network = splitName[0];
            const busName = splitName[1];

            this.addTreeField(" -> ", `<a class="fieldLink" href="/buses?arch=${nodeArch}&network=${network}&bus=${busName}">${bus}</a>  (<a class="fieldLink" href="/nodes?arch=${nodeArch}&query=${bus}">other nodes</a>)`, 1);
        }

        if (node.id)
            this.selectedInfo.innerHTML += `<span class="fieldTitle">Identifiers:</span>`;

        for (const [key, id] of Object.entries(node.id))
            this.addTreeField(" -> " + key + ": ", toHexString(id, 2), 1);

        const interactingMessages = await requestJSONWithBody("POST", "/api/v1/node/" + nodeArch + "/findMessages", {
            nodeName: nodeId
        });

        if (!interactingMessages || interactingMessages.error)
            return;

        const renderInteractingMessagePart = (type = "sending", text) => {
            if (Object.keys(interactingMessages[type]).length > 0)
                this.selectedInfo.innerHTML += `<span class="fieldTitle">${text} Messages:</span>`;

            for (const [fullBusName, messages] of Object.entries(interactingMessages[type])) {

                const splitBusName = fullBusName.split(".");
                const network = splitBusName[0];
                const bus = splitBusName[1];

                this.addTreeField(" -> Bus: ", `<a class="fieldLink" href="/buses?arch=${nodeArch}&network=${network}&bus=${bus}">${fullBusName}</a>`, 1);

                for (const [messageId, message] of Object.entries(messages)) {
                    this.addTreeField(" -> Message: ", `<a class="fieldLink" href="/buses?arch=${nodeArch}&network=${network}&bus=${bus}&message=0x${messageId}">0x${messageId}</a>`, 2);

                    if (message.name)
                        this.addTreeField(" -> Name: ", `${message.name}`, 3);

                    if (message.comment)
                        this.addTreeField(" -> Comment: ", `${message.comment[this.defaultLang]}`, 3);

                    if (message.length)
                        this.addTreeField(" -> Length: ", `${message.length}`, 3);

                    if (message.alt_names)
                        this.addTreeField(" -> Alternative Names: ", `${message.alt_names.join(", ")}`, 3);

                    if (message.signals)
                        this.addTreeField(" -> Signals: ", `${Object.keys(message.signals).join(", ")}`, 3);

                    this.addTreeField("---------------", "", 2);
                }

                this.addTreeField("<br />", "", 1);
            }
        }

        renderInteractingMessagePart("sending", "Sending");
        renderInteractingMessagePart("recieving", "Recieving");

    }


    async render() {
        this.query = this.urlParams.get("query");
        this.nodeParam = this.urlParams.get("node");
        this.archParam = this.urlParams.get("arch");

        if (!this.archParam) {
            // Show arch select
            this.setLockedSearch(true, "Select an architecture!");
            requestJSON("GET", "/api/v1/nodes").then((a) => this.renderArchSelector(a));
            return;
        }

        if (this.query) {
            this.setLockedSearch(false, "Search for message");
            this.simulateSearch(this.query);
            return;
        }

        if (!this.nodeParam) {
            this.setLockedSearch(false, "Search for nodes ...");
            // Show node select
            requestJSON("GET", "/api/v1/nodes/" + this.archParam).then((a) => this.renderNodeSelector(a, this.archParam));
            return;
        }

        this.setLockedSearch(false, "Search for nodes ...");

        // show node
        requestJSON("GET", "/api/v1/nodes/" + this.archParam).then((a) => this.renderNodeInfo(a, this.nodeParam, this.archParam));
    }

    onElementClick(element) {
        let node = element.getAttribute("data-node");
        let arch = element.getAttribute("data-arch");
        if (!node && !arch) return;

        if (!arch)
            arch = (new URLSearchParams(location.search)).get("arch");

        if (node == arch) node = "";

        let link = location.origin + "/nodes?";

        if (arch) link += "arch=" + arch + "&";
        if (node) link += "node=" + node + "&";

        this.redirectToLink(link);
    }

    async onSearch(query) {
        if (!this.archParam) {
            return;
        }

        super.onSearch(query);

        requestJSONWithBody("POST", "/api/v1/node/" + this.archParam + "/search", {
            query,
        }).then((data) => {
            this.renderNodeSelector(data, this.archParam);
        })
    }

}