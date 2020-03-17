class Project extends PersistentObject {
    constructor(name, bgColour, order) {
        super("project_");
        this.name = name;
        this.bgColour = bgColour;
        this.order = order;
    }

    static get(name) {
    }

    static getAll() {
    }

    getName() {
        return this.name;
    }
    setName(name) {
        // TODO Delete old item and add new item
        this.name = name;
    }

    getBackgroundColour() {
        return this.bgColour;
    }
    setBackgroundColour(bgColour) {
        this.bgColour = bgColour;
    }

    getOrder() {
        return this.order;
    }
    setOrder(order) {
        this.order = order;
    }

    getLogs() {
        return Log.getAll(this.name);
    }

    addLog(log) {
        log.setProjectId(this.name);
        log.save();
    }

    toJson() {
        return {
            "key": this.getKey(),
            "name": this.name,
            "bgColour": this.bgColour,
            "order": this.order
        }
    }
}
