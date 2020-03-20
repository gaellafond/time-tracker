class Project extends PersistentObject {
    constructor(name, bgColour, order) {
        super(Project.keyPrefix, Project.keyPrefix + name);
        this.name = name;
        this.bgColour = bgColour;
        this.order = order;
    }

    static get keyPrefix() {
        return "project_";
    }

    static get(projectId) {
        PersistentObject.load(projectId);
    }

    static getAll() {
        let jsonProjects = PersistentObject.getAllJSON(Project.keyPrefix);

        let projects = [];
        jsonProjects.forEach(jsonProject => {
            projects.push(new Project(
                jsonProject.name,
                jsonProject.bgColour,
                jsonProject.order
            ));
        });

        // Sort projects by order
        projects.sort(function (a, b) {
            return a.getOrder() - b.getOrder();
        });

        return projects;
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
