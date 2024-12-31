export default class {

    defaultLang = "en";

    searchList = document.querySelector(".searchList");
    renderingDetails = document.querySelector(".renderingDetails");
    search = document.querySelector(".search > input");
    selectedInfo = document.querySelector(".selectedInfo");
    dbmuxevselection = document.querySelector(".dbmuxevselection");

    constructor() {
        this.urlParams = new URLSearchParams(location.search);
        setTimeout(async () => {
            if (!window.languages) {
                const languageList = await requestJSON("GET", "/api/v1/languages");
                if (languageList)
                    Object.defineProperty(window, "languages", { value: languageList })
                else  // Backup Mode -> Define French and English
                    Object.defineProperty(window, "languages", {
                        value: {
                            en: "English",
                            fr: "French"
                        }
                    })
            }

            await this.init();
            this.onRedirect();
        }, 1);


    }

    pushLink(url) {
        history.pushState(null, null, url);
    }

    replaceCurrentPushedLink(url) {
        history.replaceState({}, "", url);
    }

    redirectToLink(url) {
        this.pushLink(url);

        this.onRedirect();
    }

    setURLParameter(parameter, value) {
        if (!this.urlParams.has(parameter))
            this.urlParams.append(parameter, value);
        else
            this.urlParams.set(parameter, value);

        const newURL = location.origin + location.pathname + `?${this.urlParams.toString()}`;
        this.replaceCurrentPushedLink(newURL);
    }

    removeURLParameter(parameter) {
        if (!this.urlParams.has(parameter))
            return;

        this.urlParams.delete(parameter);

        const newURL = location.origin + location.pathname + `?${this.urlParams.toString()}`;
        this.replaceCurrentPushedLink(newURL);
    }

    onRedirect() {
        this.urlParams = new URLSearchParams(location.search);

        this.render();
    }

    setLockedSearch(state, msg) {
        if (state)
            this.search.value = "";

        this.search.disabled = state;
        this.search.placeholder = msg;
    }

    generateBaseElement(name, func, field1, field2, field3, callback = "currentPage.onElementClick") { // currentPage.onElementClick -> this.onElementClick  
        return `<div class="searchResult" ${func}=${name}  onclick="${callback}(this)">
            <span class="searchResultId searchResultIdSmall">${name}</span>
            <div class="searchResultInfo">
                <span class="searchResultName">${field1}</span>
                <span class="searchResultCodes">${field2}</span>
                <span class="searchResultCodesName">${field3}</span>
            </div>
        </div>`;
    }

    generateArchElement(name, comment, codes, codeName) {
        return this.generateBaseElement(name, "data-arch", comment, codes, codeName);
    }

    generateNetworkElement(name) {
        return this.generateBaseElement(name, "data-network", "", "", "");
    }

    generateBusElement(name) {
        return this.generateBaseElement(name, "data-bus", "", "", "");
    }

    generateMessageElement(name, fullName, comment, signals) {
        return this.generateBaseElement(name, "data-message", fullName, comment, signals);
    }

    generateNodeElement(name, nodeName, altName, comments) {
        return this.generateBaseElement(name, "data-node", nodeName, altName, comments);
    }

    generateCarElement(name, carName, carCodes, carCodeNames) {
        return this.generateBaseElement(name, "data-car", carName, carCodes, carCodeNames);
    }

    setTitle(title) {
        document.title = "DBMUXEv Viewer: " + title;
    }

    setActiveLink(href) {
        this.dbmuxevselection.querySelector(".selected")?.classList.remove("selected");
        this.dbmuxevselection.querySelector("[href=\"" + href + "\"]")?.classList.add("selected");
    }

    onElementClick(element) {

    }

    generateLanguageSwitcher() {
        let langSwitcherHTML = `<span class="languageSwitcher">(Language: `;

        for (const langCode in window.languages)
            langSwitcherHTML += `<span class="languageSelectable" ${this.defaultLang == langCode ? `data-sel` : `onClick="currentPage.setLanguage('${langCode}')"`}>${window.languages[langCode]}</span> / `;

        return langSwitcherHTML.substring(0, langSwitcherHTML.length - 2) + `)</span>`;
    }

    setLanguage(language) {
        this.defaultLang = language;

        localStorage.setItem("language", this.defaultLang);

        // RELOAD
        this.onRedirect();
    }

    autoChooseLanguage(comment) {
        if (!comment || typeof comment !== 'object') return "";

        if (comment[this.defaultLang]) return comment[this.defaultLang];

        if (comment["en"]) return comment["en"];

        for (const commentLang in comment)
            return comment[commentLang];

        return "Error: Empty comment!"
    }

    generateConvertLink(converter, arch, busIdentifyer) {
        return `<span class="convertLink languageSwitcher">Download as <span data-sel style="cursor: pointer;" onClick="currentPage.createConvertion('${converter}','${arch}','${busIdentifyer}')">${converter}-File</span> (Choose language beforehand!)</span>`
    }

    callFunc(funcName, param) {
        try {
            this[funcName](param)
        } catch (error) {
            console.error(error)
            this.onRedirect();
        }
    }

    async createConvertion(converter, arch, bus) {
        const data = await requestJSON("GET", "/api/v1/convert/" + converter + "/" + arch + "/" + bus + "/" + this.defaultLang)

        if (data.error) {
            try { await onLoad(); /* LOAD */ } catch (e) { }
            renderingDetails.innerHTML += `<br>Download-Error: ` + data.error;
            return;
        }

        const downloadCapsule = document.createElement('a');

        downloadCapsule.style.display = 'none';
        downloadCapsule.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.file);
        downloadCapsule.download = bus + '-' + this.defaultLang + '.' + data.extention;
        document.body.appendChild(downloadCapsule);
        downloadCapsule.click();
        document.body.removeChild(downloadCapsule);
    }

    addField(field, value) {
        this.selectedInfo.innerHTML += `<span class="field">${field}<span class="fieldValue">${value}</span></span>`;
    }

    addTreeField(field, value, depth) {
        this.selectedInfo.innerHTML += `<span class="field" data-depth="${depth}">${field}<span class="fieldValue">${value}</span></span>`
    }

    checkedTreeField(a, b, c) {
        if (!a || !b || !c) return;

        this.addTreeField(a, b, c);
    }

    addFieldTitle(title) {
        this.selectedInfo.innerHTML += `<span class="fieldTitle">${title}</span>`;
    }

    setInfoActive(bool) {
        this.selectedInfo.style.display = bool ? "block" : "none";
        this.searchList.style.display = bool ? "none" : "block";
    }

    async render() { }

    async init() {
        this.search.value = "";

        const storedLanguage = localStorage.getItem("language");

        if (storedLanguage && window.languages[storedLanguage])
            this.defaultLang = storedLanguage;

    }

    addBackButtonToSearch() {
        this.searchList.innerHTML += `<span class="selTitle backButton"><a class="headerLink selected" onclick="history.back()">Back</a></span>`;
    }

    async handleKeyUpEvent(event) {
        if (this.search.value == this.lastSearch)
            return;

        this.lastSearch = this.search.value;

        if (this.search.value.length < 1) {
            this.onEndSearch();
            return;
        }

        this.onSearch(this.search.value);
    }

    async onSearch(query) {
        this.setURLParameter("query", query);
    }

    async onEndSearch() {
        this.removeURLParameter("query");
        this.onRedirect();
    }

    async simulateSearch(query) {
        this.search.value = query;
        this.onSearch(query);
    }

    sortHexKeyArray(array = []) {
        return array.sort((a, b) => {
            return parseInt(a, 16) - parseInt(b, 16)
        })
    }

    setRenderingDetails = (content) => this.renderingDetails.innerHTML = content;

}
