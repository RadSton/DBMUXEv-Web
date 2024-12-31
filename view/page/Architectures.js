import Shared from "./Shared.js"

export default class Architectures extends Shared {
    constructor() {
        super()
        this.setTitle("Architectures");
        this.setActiveLink("/architecture");
    }

    async init() {
        await super.init();

        this.setLockedSearch(false, "Search for architectures ...");
    }

    async render() {
        this.query = this.urlParams.get("query");
        this.archParam = this.urlParams.get("arch");

        this.selectedInfo.style.display = "none";
        this.searchList.style.display = "none";

        if (!this.archParam) {
            if (!this.query)
                requestJSON("GET", "/api/v1/architectures").then((a) => this.renderArchitectureSelector(a))
            else
                this.simulateSearch(this.query);
            return;
        }

        requestJSON("GET", "/api/v1/architecture/" + this.archParam).then((a) => this.renderArchInfo(a, this.archParam)).catch(error => this.renderArchInfo({ error }, this.archParam));
    }

    onElementClick(element) {
        let arch = element.getAttribute("data-arch");

        if (!arch) return;

        let link = location.origin + "/architectures?";

        if (arch) link += "arch=" + arch + "&";

        this.redirectToLink(link);
    }

    renderArchitectureSelector(architectureContainer) {

        this.setInfoActive(false);
        this.setRenderingDetails(`Select a architecture ${this.generateLanguageSwitcher()}`);

        if (architectureContainer.error) {
            this.searchList.innerHTML =
                `<div style="display: block; text-align: center;">
                <h1>Failed to load architectures:</h1> 
                <h5>${architectureContainer.error}</h5>
                <span class="selTitle"><a class="headerLink selected" href="/architectures">Reset filters</a></span>
            </div>`;
            return;
        }

        let result = "";

        for (const baseArchKey in architectureContainer) {
            for (const [baseVariantKey, arch] of Object.entries(architectureContainer[baseArchKey])) {
                const archKey = baseArchKey + "." + baseVariantKey;

                let note = arch.comment ? "Comment: " + this.autoChooseLanguage(arch.comment) : "";
                let networks = arch.networks ? "Networks: " + Object.keys(arch.networks).join(", ") : "";
                let protocols = arch.protocols ? "Protocols: " + arch.protocols.join(", ") : "";

                if (typeof arch == 'string')
                    networks = "Note: " + arch;

                result += this.generateArchElement(archKey, note, networks, protocols);
            }
        }

        this.searchList.innerHTML = result;
    }

    renderArchInfo(arch, fullArchitectureName) {

        this.setInfoActive(true);
        this.setRenderingDetails("");

        const nameArchParts = fullArchitectureName.split(".");
        const architectureName = nameArchParts[0];
        const architectureVariant = nameArchParts[1];


        if (!arch) {
            this.selectedInfo.innerHTML = `
                <span class="selTitle">The architecture <span class="selType">${architectureName}</span> wasnt found in <span class="selType">architectures.yml</span></span>
                <span class="selTitle"><a class="headerLink selected" href="/architectures">Reset filters</a></span>
                `;
            return;
        }

        if (arch.error) {
            if (!arch.error?.message?.includes("TODO"))
                this.selectedInfo.innerHTML = `
                    <span class="selTitle">Error when loading <span class="selType">${architectureName}</span> from <span class="selType">architectures.yml</span></span>
                    <span class="selTitle">Error: <span class="selType">${arch.error}</span></span>
                    <span class="selTitle"><a class="headerLink selected" href="/architectures">Reset filters</a></span>
                    `;
            else
                this.selectedInfo.innerHTML = `
                    <span class="selTitle">Error when loading <span class="selType">${architectureName}</span> from <span class="selType">architectures.yml</span></span>
                    <span class="selTitle">This page is still TODO and not available yet!</span>
                    <span class="selTitle"><a class="headerLink selected" href="/architectures">Reset filters</a></span>
                    `;
            return;
        }


        this.selectedInfo.innerHTML = `<span class="selTitle"><span class="selType">architectures</span>.yml -> <span class="selType">${architectureName}</span></span>`;

        this.setRenderingDetails(`Showing architecture ${fullArchitectureName} ${this.generateLanguageSwitcher()}`);

        this.addField("Architecture: ", architectureName)
        this.addField("Variant: ", architectureVariant)

        if (arch.comment)
            this.addField("Comment: ", this.autoChooseLanguage(arch.comment));

        this.addField("Nodes: ", `<a href="/nodes?arch=${fullArchitectureName}" class="fieldLink">${architectureName}.${architectureVariant}</a>`)

        if (arch.protocols) {
            this.selectedInfo.innerHTML += `<span class="fieldTitle">Protocols:</span>`;

            for (const protocol of arch.protocols)
                this.addTreeField(" -> ", protocol, 1);
        }

        if (!arch.networks) return;

        this.selectedInfo.innerHTML += `<span class="fieldTitle">Networks:</span>`;

        for (const [networkName, network] of Object.entries(arch.networks)) {

            this.addTreeField(" -> Network: ", `<a href="/buses?arch=${fullArchitectureName}&network=${networkName}" class="fieldLink">${networkName}</a>`, 1);

            for (const busName in network) {

                const bus = network[busName];

                this.addTreeField(" -> Bus: ", `<a href="/buses?arch=${fullArchitectureName}&network=${networkName}&bus=${busName}" class="fieldLink">${busName}</a>`, 2);

                if (bus.display_name)
                    this.addTreeField(" -> Name: ", this.autoChooseLanguage(bus.display_name), 3);

                if (bus.comment)
                    this.addTreeField(" -> Note: ", this.autoChooseLanguage(bus.comment), 3);
            }

            this.addTreeField(":---------:", "", 1);
        }

    }

    async onSearch(query) {
        super.onSearch(query);
        requestJSONWithBody("POST", "/api/v1/architecture/search",
            {
                query
            }
        ).then((data) => this.renderArchitectureSelector(data))
    }

} 