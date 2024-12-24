import Shared from "./Shared.js"

export default class Buses extends Shared {
    constructor() {
        super()
        this.setTitle("Buses");
        this.setActiveLink("/buses");
    }

    async init() {
        await super.init();

        this.buses = await requestJSON("GET", "/api/v1/buses");
    }


    renderArchitectureSelector() {

        this.setInfoActive(false);
        this.setRenderingDetails(`Select a architecture ${this.generateLanguageSwitcher()}`);

        let result = "";

        for (const architecture of Object.keys(this.buses)) {
            const split = architecture.split(".");

            result += this.generateArchElement(architecture, "Architecture: " + split[0], "Variant: " + split[1], "Cars after " + split[0].replaceAll("AEE", ""));
        }

        this.searchList.innerHTML = result;
    }

    renderNetworkSelector(networkNames) {

        this.setInfoActive(false);
        this.setRenderingDetails(`Select a network ${this.generateLanguageSwitcher()}`);

        let result = "";

        for (const network of networkNames)
            result += this.generateNetworkElement(network);

        this.searchList.innerHTML = result;
    }

    renderBusSelector(busNames, arch, network) {

        this.setInfoActive(false);
        this.setRenderingDetails(`Select a bus from ${network} in ${arch} ${this.generateLanguageSwitcher()}`);

        let result = "";

        for (const bus of busNames)
            result += this.generateBusElement(bus);

        this.searchList.innerHTML = result;
    }

    renderMessageSelector(messages, arch, network, bus) {

        this.setInfoActive(false);
        this.setRenderingDetails(`Select a message from ${network}.${bus} in ${arch} ${this.generateLanguageSwitcher()} <br/> ${this.generateConvertLink("DBC", arch, network + "." + bus)}`);

        let result = "";

        for (const message of this.sortHexKeyArray(Object.keys(messages))) {
            const data = messages[message];

            const name = data.name ? "Name: " + data.name : "";
            const comment = data.comment ? "Comment: " + data.comment[this.defaultLang] : "";
            const signals = data.signals ? "Signals: " + Object.keys(data.signals).join(", ") : "";

            result += this.generateMessageElement(toHexString(message, 3), name, comment, signals);
        }

        this.searchList.innerHTML = result;
    }

    renderMessageInfo(message, arch, network, bus, messageId) {
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 1); // set Timeout is just so that it runs async seems to block thread otherwise

        this.setInfoActive(true);
        this.setRenderingDetails("");

        if (!message) {
            this.selectedInfo.innerHTML = `
                <span class="selTitle">The message <span class="selType">${messageId}</span> wasnt found in ${arch}/${network}.${bus}</span>
                <span class="selTitle"><a class="headerLink selected" href="/buses">Reset filters</a></span>
            `;
            return;
        }

        this.selectedInfo.innerHTML = `<span class="selTitle"><span class="selType">${arch}</span>/<span class="selType">${network}.${bus}</span>/<span class="selType">${messageId.replaceAll("0x", "")}</span>.yml -> <span class="selType">${messageId}</span></span>`;

        this.setRenderingDetails(`Showing message ${messageId} ${this.generateLanguageSwitcher()}`);

        this.addField("Id: ", messageId);

        if (message.name)
            this.addField("Name: ", message.name);

        if (message.comment)
            this.addField("Comment: ", message.comment[this.defaultLang]);

        if (message.alt_names)
            this.addField("Alternative names: ", message.alt_names.join(", "));

        if (message.type)
            this.addField("Type: ", message.type);

        if (message.periodicity)
            this.addField("Periodicity: ", message.periodicity);

        if (message.length)
            this.addField("Length: ", message.length);

        this.selectedInfo.innerHTML += `<span class="fieldTitle">Nodes:</span>`;

        if (message.senders && message.senders.length > 0) {
            this.addTreeField("-> Senders: ", "", 1);

            for (const sender of message.senders)
                this.addTreeField("-> ", `<a class="fieldLink" href="/nodes?arch=${arch}&node=${sender}">${sender}</a>`, 2)
        }

        if (message.receivers && message.receivers.length > 0) {
            this.addTreeField("-> Receivers: ", "", 1);

            for (const sender of message.receivers)
                this.addTreeField("-> ", `<a class="fieldLink" href="/nodes?arch=${arch}&node=${sender}">${sender}</a>`, 2)
        }

        this.selectedInfo.innerHTML += `<span class="fieldTitle">Signals:</span>`;

        for (const signalName in message.signals) {

            const signal = message.signals[signalName];

            this.addTreeField("-> ", signalName, 1);

            if (signal.comment)
                this.checkedTreeField("-> Comment: ", signal.comment[this.defaultLang], 2);

            this.checkedTreeField("-> Bits: ", signal.bits, 2);
            this.checkedTreeField("-> Unused: ", signal.unused, 2);

            if (signal.alt_names)
                this.checkedTreeField("-> Alternative Names: ", signal.alt_names.join(", "), 2);

            this.checkedTreeField("-> Type: ", signal.type, 2);
            this.checkedTreeField("-> Signed: ", signal.signed, 2);
            this.checkedTreeField("-> Min: ", signal.min, 2); 
            this.checkedTreeField("-> Max: ", signal.max, 2);
            this.checkedTreeField("-> Units: ", signal.units, 2);
            this.checkedTreeField("-> Offset: ", signal.offset, 2);
            this.checkedTreeField("-> factor: ", signal.factor, 2);

            if (!signal.values) {
                this.addField("-------------------", "");
                continue;
            }

            this.checkedTreeField("-> values: ", signal.factor, 2);

            for (const [valKey, val] of Object.entries(signal.values))
                this.checkedTreeField("-> " + toHexString(valKey, 2) + ": ", val[this.defaultLang], 3);

            this.addField("-------------------", "");
        }
    }

    async render() {
        this.query = this.urlParams.get("query");
        this.arch = this.urlParams.get("arch");
        this.network = this.urlParams.get("network");
        this.bus = this.urlParams.get("bus");
        this.message = this.urlParams.get("message");

        this.selectedInfo.style.display = "none";
        this.searchList.style.display = "none";

        if (!this.arch || !this.buses[this.arch]) {
            this.setLockedSearch(true, "Select bus first!");
            this.renderArchitectureSelector()
            return;
        }

        let networkNames = Object.keys(this.buses[this.arch]).map(x => x.split(".")[0]);

        if (!this.network || !networkNames.includes(this.network)) {
            this.setLockedSearch(true, "Select bus first!");
            this.renderNetworkSelector(networkNames);
            return;
        }

        let busNames = Object.keys(this.buses[this.arch]).filter(x => x.startsWith(this.network)).map(x => x.split(".")[1]);

        if (!this.bus || !busNames.includes(this.bus)) {
            this.setLockedSearch(true, "Select bus first!");
            this.renderBusSelector(busNames, this.arch, this.network);
            return;
        }

        if(this.query) {
            this.setLockedSearch(false, "Search for message");
            this.simulateSearch(this.query);
            return;
        }

        let messages = this.buses[this.arch][this.network + "." + this.bus];

        if (!this.message) {
            this.setLockedSearch(false, "Search for message");
            this.renderMessageSelector(messages, this.arch, this.network, this.bus);
            return;
        }

        this.setLockedSearch(false, "Search for message");
        this.renderMessageInfo(messages[this.message.replaceAll("0x", "")], this.arch, this.network, this.bus, this.message);
    }

    onElementClick(element) {

        let arch = element.getAttribute("data-arch");
        let network = element.getAttribute("data-network");
        let bus = element.getAttribute("data-bus");
        let message = element.getAttribute("data-message");

        if (!arch) arch = this.urlParams.get("arch");
        if (!network) network = this.urlParams.get("network");
        if (!bus) bus = this.urlParams.get("bus");
        if (!message) message = this.urlParams.get("message");

        let link = location.origin + "/buses?";

        if (arch) link += "arch=" + arch + "&";
        if (network) link += "network=" + network + "&";
        if (bus) link += "bus=" + bus + "&";
        if (message) link += "message=" + message + "&";

        this.redirectToLink(link);
    }

    async onSearch(query) {
        super.onSearch(query);
        requestJSONWithBody("POST", "/api/v1/buses/search",
            {
                query,
                arch: this.arch,
                identifyer: this.network + "." + this.bus
            }
        ).then((data) => this.renderMessageSelector(data, this.arch, this.network, this.bus))
    }

}