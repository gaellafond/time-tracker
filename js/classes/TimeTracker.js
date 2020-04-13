class TimeTracker {

    constructor(timeTrackerEl) {
        this.load();

        this.checkOutButtonEl = $(`<button style="float: right">Check out</button>`);
        this.pageTitleEl = $(`<h1 class="pageTitle">${this.getName()}</h1>`);
        this.todayTimeRibbonEl = $(`<div class="time-ribbon today-time-ribbon"></div>`);
        this.dashboardEl = $(`<div class="dashboard"></div>`);
        this.showAdminbuttonEl = $(`<button style="float: right">Admin</button>`);

        timeTrackerEl.append(this.checkOutButtonEl);
        timeTrackerEl.append(this.pageTitleEl);
        timeTrackerEl.append(this.todayTimeRibbonEl);
        timeTrackerEl.append(this.dashboardEl);
        timeTrackerEl.append(this.showAdminbuttonEl);

        this.projectMap = {};

        this.runningLog = null;
        this.runningLogInterval = null;

        this.admin = new Admin(this);

        this.newProjectBox =
            $(`<div class="new-project" id="new-project">
                <div class="buttons"><button class="new">New Project</button></div>
            </div>`);

        this.newProjectBox.find("button.new").click(function(timeTracker) {
            return function() {
                const projects = timeTracker.getProjects();
                let colourIndex = 1;
                let projectOrder = 1;
                if (projects !== null && projects.length > 0) {
                    const lastProject = projects[projects.length - 1];
                    colourIndex = projects.length + 1;
                    projectOrder = lastProject.getOrder() + 1;
                }
                let newProject = new Project(timeTracker, "New project", colourIndex, projectOrder);
                newProject.save();
                timeTracker.addProject(newProject);
                timeTracker.reloadProjectsMarkup();
            };
        }(this));

        this.dashboardEl.append(this.newProjectBox);

        this.reloadProjects();
        this.reloadProjectsMarkup();

        this.todayTimeRibbon = new TimeRibbon(this.todayTimeRibbonEl, this);
        this.todayTimeRibbon.render([Utils.formatDate(Utils.getCurrentTimestamp())]);

        this.addEventListeners();
    }

    load() {
        const timeTrackerDataStr = window.localStorage.getItem('timeTrackerData');
        if (timeTrackerDataStr) {
            const jsonTimeTrackerData = JSON.parse(timeTrackerDataStr);

            this.name = jsonTimeTrackerData["name"];
        } else {
            this.name = "Your name";
        }
    }
    save() {
        const jsonTimeTrackerData = {
            "name": this.name
        };

        window.localStorage.setItem('timeTrackerData', JSON.stringify(jsonTimeTrackerData));
    }

    getName() {
        return this.name;
    }
    setName(newName) {
        this.name = newName;
    }

    addEventListeners() {
        this.checkOutButtonEl.click(function(timeTracker) {
            return function() {
                timeTracker.stopLogCounter();
            };
        }(this));

        this.showAdminbuttonEl.click(function(timeTracker) {
            return function() {
                timeTracker.showAdmin();
            };
        }(this));

        this.pageTitleEl.click(function(timeTracker) {
            return function() {
                // Hide the title (it will be replaced with a input field)
                const titleEl = $(this);
                titleEl.hide();

                // Create an input field, add it in the markup after the (hidden) title
                const inputContainerEl = $(`<div class="pageTitle"></div>`);
                const inputEl = $(`<input type="text" value="${Utils.escapeHTML(timeTracker.getName())}">`);
                inputContainerEl.append(inputEl);
                titleEl.after(inputContainerEl);
                inputEl.select(); // Select the text in the text field

                const changeFunction = function(timeTracker, inputContainerEl, inputEl) {
                    return function() {
                        // Get the new project name that was typed
                        const newName = inputEl.val();

                        // Set the new name on the markup and in the Project object
                        titleEl.html(Utils.escapeHTML(newName));
                        timeTracker.setName(newName);
                        timeTracker.save();

                        // Delete the input field and show the changed title
                        inputContainerEl.remove();
                        titleEl.show();
                    };
                }(timeTracker, inputContainerEl, inputEl);

                // Update the project name when
                inputEl.change(changeFunction); // The user tape "enter"
                inputEl.focusout(changeFunction); // The user click somewhere else in the page
            };
        }(this));

    }

    showAdmin() {
        this.admin.show();
    }

    reload() {
        this.fixProjectOrder();
        this.todayTimeRibbon.render([Utils.formatDate(Utils.getCurrentTimestamp())]);
    }

    reloadProjects() {
        let jsonProjects = PersistentObject.getAllJSON(Project.keyPrefix);
        jsonProjects.forEach(jsonProject => {
            this.addProject(Project.load(this, jsonProject));
        });

        this.loadProjectsLogs();
    }

    addProject(project) {
        this.projectMap[project.getKey()] = project;
    }

    getProjectMap() {
        return this.projectMap;
    }

    getProjects() {
        // Return an array of projects, ordered my "order"
        const projects = Object.values(this.projectMap);

        // Sort projects by order
        projects.sort(function (a, b) {
            return a.getOrder() - b.getOrder();
        });

        return projects;
    }

    // Used to auto fix order after drag n drop, delete project, etc
    fixProjectOrder() {
        this.fixDatabaseProjectOrder();
        this.reloadProjectsMarkup();
    }

    // NOTE: If the app has no bug, this will do nothing.
    fixDatabaseProjectOrder() {
        const projects = this.getProjects();

        let changed = false;
        $.each(projects, function(index, project) {
            let expectedOrder = index + 1;
            if (project.getOrder() !== expectedOrder) {
                project.setOrder(expectedOrder);
                project.save();
                changed = true;
            }
        });

        return changed;
    }

    // Used to re-order project after a drag n drop
    reloadProjectsMarkup() {
        // Remove all projects
        this.dashboardEl.find(".project").remove();

        const projects = this.getProjects();
        $.each(projects, function(timeTracker) {
            return function(index, project) {
                // Insert the JQuery element to the page Markup, before the "New Project" box
                timeTracker.newProjectBox.before(project.getMarkup());
                project.scrollToBottom();
                project.addEventListeners();
            };
        }(this));
    }

    getProject(projectKey) {
        return this.projectMap[projectKey];
    }

    loadProjectsLogs() {
        $.each(this.projectMap, function(projectKey, project) {
            project.loadLogs();
        });
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
                let elapse = Utils.getCurrentTimestamp() - log.getStartDate();
                logEl.html(Utils.formatTime(elapse));
            };
        }(log), 500);
    }

    stopLogCounter() {
        this.runningLog.setEndDate(Utils.getCurrentTimestamp());
        this.runningLog.save();

        // Stop incrementing the counter on the screen
        window.clearInterval(this.runningLogInterval);
        this.runningLogInterval = null;

        this.runningLog.getProject().setActive(false);
        this.runningLog = null;
    }
}
