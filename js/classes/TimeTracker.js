class TimeTracker {

    constructor(dashboardEl) {
        this.dashboardEl = dashboardEl;
        this.projectMap = {};

        this.runningLog = null;
        this.runningLogInterval = null;

        this.newProjectBox =
            $(`<div class="new project" id="new-project">
                <div class="buttons"><button class="new">New Project</button></div>
            </div>`);

        this.newProjectBox.find("button.new").click(function(timeTracker) {
            return function() {
                let lastProject = timeTracker.getLastProject();
                let newProject = new Project(timeTracker, "New project", lastProject.getBackgroundColourIndex() + 1, lastProject.getOrder() + 1);
                newProject.save();
                timeTracker.addProject(newProject);
            };
        }(this));

        this.dashboardEl.append(this.newProjectBox);

        const projects = Project.getAll(this);
        projects.forEach(function(timeTracker) {
            return function(project) {
                timeTracker.addProject(project);
            };
        }(this));
    }

    addProject(project) {
        // Insert the JQuery element to the page Markup, before the "New Project" box
        this.newProjectBox.before(project.getMarkup());
        this.projectMap[project.getKey()] = project;
    }

    getProjectMap() {
        return this.projectMap;
    }

    getProjects() {
        // Return an array of projects, ordered my "order"
        const projects = Object.values(this.projectMap);

        // TODO sort
    }

    getProject(projectKey) {
        return this.projectMap[projectKey];
    }

    getLastProject() {
        const projects = this.getProjects();
        return projects[projects.length - 1];
    }

    startLogCounter(log) {
        const logEl = log.markup.find(".time");

        if (this.runningLog) {
            this.stopLogCounter();
        }
        this.runningLog = log;
        log.project.setActive(true);

        this.runningLogInterval = window.setInterval(function(log) {
            return function() {
                let elapse = Log.getCurrentTimestamp() - log.getStartDate();
                logEl.html(Log.formatTime(elapse));
            };
        }(log), 500);
    }

    stopLogCounter() {
        // Stop incrementing the counter on the screen
        window.clearInterval(this.runningLogInterval);
        this.runningLogInterval = null;

        this.runningLog.getProject().setActive(false);
        this.runningLog = null;
    }

}
