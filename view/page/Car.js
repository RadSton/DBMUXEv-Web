import Shared from "./Shared.js"

export default class Car extends Shared {
    constructor() {
        super()
        this.setTitle("Cars");
        this.setActiveLink("/cars");
    }

    async init() {
        await super.init();

        this.setLockedSearch(false, "Search for cars ...")
    }

    async render() {
        this.query = this.urlParams.get("query");
        this.carParam = this.urlParams.get("car");

        if(this.query) {
            this.simulateSearch(this.query);
            return;
        }

        if (!this.carParam) {
            requestJSON("GET", "/api/v1/cars").then((a, b, c) => this.renderCarListFromData(a, b, c))
            return;
        }

        requestJSON("GET", "/api/v1/car/" + this.carParam).then((a) => this.renderCarInfo(a));
    }

    onElementClick(element) {
        super.onElementClick(element);
        const carId = element.getAttribute("data-car");

        if (!carId) return;

        this.redirectToLink(location.origin + "/cars?car=" + carId);
    }

    renderCarListFromData(data) {
        this.setInfoActive(false);

        let toRender = "";
        let carCounter = 0;

        for (const [carId, car] of Object.entries(data)) {
            carCounter++;

            let carName = car.name != undefined ? car.name : "";
            let carCodesArray = [];
            let carCodesNamesArray = [];

            for (const [carCode, carCodeNames] of Object.entries(car.codes)) {
                carCodesArray.push(carCode);

                if (typeof carCodeNames === 'string')
                    carCodesNamesArray.push(carCodeNames)
                else
                    carCodesNamesArray.push(carCodeNames.join(", "))
            }

            toRender += this.generateCarElement(carId, carName, carCodesArray.join(", "), carCodesNamesArray.join(", "))
        }

        this.searchList.innerHTML = toRender;
        this.setRenderingDetails(`Showing ${carCounter} cars`);
    }

    renderCarInfo(data) {
        this.setInfoActive(true);
        this.setRenderingDetails(``);

        if (data.error) {
            this.selectedInfo.innerHTML = `
            <div style="display: block; text-align: center;">
                <h1>Failed to load page:</h1> 
                <h5>${data.error}</h5>
            </div>`
            return;
        }

        this.selectedInfo.innerHTML = `<span class="selTitle">cars/<span class="selType">${this.carParam}</span>.yml</span>`;

        if (data.names)
            this.addField("Name: ", data.names.join(", "));

        this.addFieldTitle("Codes:");

        for (const [keyCode, code] of Object.entries(data.codes)) {
            const keyCodeStr = " -> " + keyCode + ": ";

            if (typeof code === 'string')
                this.addField(keyCodeStr, code)
            else
                this.addField(keyCodeStr, code.join(", "));
        }

        this.addFieldTitle("Versions:")

        let counter = 0;

        for (const versionKey of Object.keys(data.versions)) {
            counter++;

            const version = data.versions[versionKey]

            this.addTreeField("-> Version ", counter, 0);
            this.addTreeField("-> Name: ", versionKey, 1);
            this.addTreeField("-> Architecture: ", `<a class="fieldLink" href="/architectures?arch=${version.architecture}">${version.architecture}</a>`, 1); // TODO: Link

            if (!version.nodes) continue;

            this.addTreeField("-> Nodes: ", "", 1);

            for (const [nodeKey, ecuList] of Object.entries(version.nodes)) {
                this.addTreeField("-> ", nodeKey, 2);

                for (const ecuOnNode of ecuList)
                    this.addTreeField("-> ", `<a class="fieldLink" href="/nodes?arch=${version.architecture}&node=${ecuOnNode}">${ecuOnNode}</a>`, 3); // TODO: Link
            }
        }

        this.setRenderingDetails(`Showing car ${this.carParam}`);
    }

    async onSearch(query) {
        super.onSearch(query);
        requestJSONWithBody("POST", "/api/v1/cars/search",
            {
                query
            }
        ).then((data) => this.renderCarListFromData(data))
    }

}