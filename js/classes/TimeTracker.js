class TimeTracker {

    constructor(timeTrackerEl) {
        this.load();

        this.headerEl = $(`<div class="header"></div>`);

        this.spaceLeftContainerEl = $(`<div class="spaceLeft"></div>`);
        this.spaceLeftEl = $(`<span>?</span>`);
        this.spaceLeftContainerEl.append(this.spaceLeftEl);

        this.pageTitleContainerEl = $(`<div class="pageTitle"></div>`);
        this.pageTitleEl = $(`<h1>${this.getName()}</h1>`);
        this.pageTitleContainerEl.append(this.pageTitleEl);

        this.checkOutButtonEl = $(`<button>Stop timer</button>`);
        this.showAdminButtonEl = $(`<button>Admin</button>`);

        this.headerEl.append(this.spaceLeftContainerEl);
        this.headerEl.append(this.pageTitleContainerEl);
        this.headerEl.append(this.checkOutButtonEl);
        this.headerEl.append(this.showAdminButtonEl);

        this.todayTimeRibbonEl = $(`<div class="time-ribbon today-time-ribbon"></div>`);
        this.dashboardEl = $(`<div class="dashboard"></div>`);
        

        timeTrackerEl.append(this.headerEl);
        timeTrackerEl.append(this.todayTimeRibbonEl);
        timeTrackerEl.append(this.dashboardEl);


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
                let newProject = new Project(timeTracker, "New project", colourIndex, projectOrder, true);
                newProject.save();
                timeTracker.addProject(newProject);
                timeTracker.reloadProjectsMarkup();
            };
        }(this));

        this.dashboardEl.append(this.newProjectBox);

        this.reloadProjects();
        this.reloadProjectsMarkup();

        const currentDay = Utils.getCurrentDayStart();
        const oneDay = 24 * 60 * 60;
        this.todayTimeRibbonFilter = new LogFilter(currentDay, currentDay + oneDay);
        this.todayTimeRibbon = new TimeRibbon(this.todayTimeRibbonEl, this);
        this.todayTimeRibbon.render(this.todayTimeRibbonFilter);

        this.updateSpaceLeft();
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
        Utils.notifyLocalStorageChange();
    }

    getName() {
        return this.name;
    }
    setName(newName) {
        this.name = newName;
    }

    updateSpaceLeft() {
        const bytesLeft = Utils.getLocalStorageRemainingSpace();
        const mbLeft = bytesLeft / (1024 * 1024);
        this.spaceLeftEl.html((mbLeft).toFixed(2));
    }

    addEventListeners() {
        $(window).on("localStorageChange", function(timeTracker) {
            return function(event) {
                timeTracker.updateSpaceLeft();
            };
        }(this));

        this.checkOutButtonEl.click(function(timeTracker) {
            return function() {
                timeTracker.stopLogCounter();
            };
        }(this));

        this.showAdminButtonEl.click(function(timeTracker) {
            return function() {
                timeTracker.showAdmin();
            };
        }(this));

        const editablePageTitle = new EditableString(this.pageTitleEl, function(timeTracker) {
            return function(oldValue, newValue) {
                timeTracker.setName(newValue);
                timeTracker.save();
            };
        }(this));
        editablePageTitle.setAutoSelect(true);
    }

    showAdmin() {
        this.admin.show();
    }

    reload() {
        this.reloadProjects();
        this.reloadProjectsMarkup();

        this.todayTimeRibbon.render(this.todayTimeRibbonFilter);
    }

    reloadProjects() {
        this.projectMap = {};

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
        return this._sortProjectArray(Object.values(this.projectMap));
    }

    getSelectedProjects() {
        // Return an array of selected projects, ordered my "order"
        const projects = [];
        $.each(this.projectMap, function(projectKey, project) {
            if (project.isSelected()) {
                projects.push(project);
            }
        });
        return this._sortProjectArray(projects);
    }

    _sortProjectArray(projects) {
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
        if (this.runningLog) {
            if (this.runningLog.getKey() === log.getKey()) {
                this.runningLog = null;
            }
            this.stopLogCounter();
        }
        this.runningLog = log;
        log.project.setActive(true);
        this.changePageTitle(log.project.getName());

        this.runningLogInterval = window.setInterval(function(log) {
            return function() {
                const logEl = log.markup.find(".time");
                let elapse = Utils.getCurrentTimestamp() - log.getStartDate();
                logEl.html(Utils.formatTime(elapse));
            };
        }(log), 500);
    }

    stopLogCounter() {
        this.changePageTitle();
        if (this.runningLog != null) {
            this.runningLog.setEndDate(Utils.getCurrentTimestamp());
            this.runningLog.save();
            this.runningLog.getProject().setActive(false);
            this.runningLog = null;
        }

        // Stop incrementing the counter on the screen
        window.clearInterval(this.runningLogInterval);
        this.runningLogInterval = null;
    }

    changePageTitle(subTitle) {
        if (subTitle) {
            document.title = "[" + Utils.escapeHTML(subTitle) + "] - Time Tracker";
        } else {
            document.title = "Time Tracker";
        }
    }
}
