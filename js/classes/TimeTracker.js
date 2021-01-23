class TimeTracker {

    constructor(timeTrackerEl) {
        this.load();

        // Header
        this.headerEl = $(`<div class="header"></div>`);

        // Left buttons
        this.leftButtonDivEl = $(`<div class="header-buttons-left"></div>`);

        this.pauseButtonEl = $(`<button>Pause</button>`);
        this.spaceLeftEl = $(`<span class="spaceLeft">?</span>`);

        this.leftButtonDivEl.append(this.pauseButtonEl);
        this.leftButtonDivEl.append(this.spaceLeftEl);


        // Title
        this.pageTitleContainerEl = $(`<div class="pageTitle"></div>`);
        this.pageTitleEl = $(`<h1>${this.getName()}</h1>`);
        this.pageTitleContainerEl.append(this.pageTitleEl);


        // Right buttons
        this.rightButtonsDivEl = $(`<div class="header-buttons-right"></div>`);
        this.checkOutButtonEl = $(`<button>Stop timer</button>`);
        this.showAdminButtonEl = $(`<button>Admin</button>`);

        this.rightButtonsDivEl.append(this.checkOutButtonEl);
        this.rightButtonsDivEl.append(this.showAdminButtonEl);


        // Assemble header
        this.headerEl.append(this.leftButtonDivEl);
        this.headerEl.append(this.pageTitleContainerEl);
        this.headerEl.append(this.rightButtonsDivEl);

        this.todayTimeRibbonEl = $(`<div class="time-ribbon today-time-ribbon"></div>`);
        this.dashboardEl = $(`<div class="dashboard"></div>`);
        

        timeTrackerEl.append(this.headerEl);
        timeTrackerEl.append(this.todayTimeRibbonEl);
        timeTrackerEl.append(this.dashboardEl);


        this.projectMap = {};

        this.runningLog = null;
        this.runningLogInterval = null;

        this.pausePage = new PausePage(this);
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
        this.todayTimeRibbonFilter = new LogDateFilter(currentDay, currentDay + oneDay);
        this.todayTimeRibbon = new TimeRibbon(this.todayTimeRibbonEl, this);
        this.todayTimeRibbon.render([this.todayTimeRibbonFilter]);

        this.updateSpaceLeft();
        this.addEventListeners();
    }

    load() {
        const timeTrackerDataStr = window.localStorage.getItem('timeTrackerData');
        this.timeNormalisationPercentage = 1.13;

        if (timeTrackerDataStr) {
            const jsonTimeTrackerData = JSON.parse(timeTrackerDataStr);

            this.name = jsonTimeTrackerData["name"];
            if (jsonTimeTrackerData.hasOwnProperty("timeNormalisationPercentage")) {
                this.timeNormalisationPercentage = jsonTimeTrackerData["timeNormalisationPercentage"];
            }
        } else {
            this.name = "Your name";
        }
    }
    save() {
        const jsonTimeTrackerData = {
            "name": this.name,
            "timeNormalisationPercentage": this.timeNormalisationPercentage
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

    getTimeNormalisationPercentage() {
        return this.timeNormalisationPercentage;
    }
    setTimeNormalisationPercentage(timeNormalisationPercentage) {
        this.timeNormalisationPercentage = timeNormalisationPercentage;
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

        this.pauseButtonEl.click(function (timeTracker) {
            return function() {
                timeTracker.pausePage.pause();
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

        this.todayTimeRibbon.render([this.todayTimeRibbonFilter]);
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

        this.flagOverlappingLogs();
    }

    flagOverlappingLogs() {
        const allLogs = {}; // Array of all logs, used to flag overlapping dates
        $.each(this.projectMap, function(projectKey, project) {
            const logs = project.getLogs();

            $.each(logs, function(logIndex, log) {
                // Collect all logs to set log overlap flags
                log.startDateOverlaps = false;
                log.endDateOverlaps = false;
                if (allLogs[log.getStartDate()]) {
                    log.startDateOverlaps = true;
                    allLogs[log.getStartDate()].startDateOverlaps = true;
                } else {
                    allLogs[log.getStartDate()] = log;
                }
            });
        });

        const logStartDates = Object.keys(allLogs);
        logStartDates.sort();
        let previousLog = null;
        $.each(logStartDates, function(dateIndex, startDate) {
            const log = allLogs[startDate];
            if (previousLog && previousLog.getEndDate() > log.getStartDate()) {
                previousLog.endDateOverlaps = true;
                log.startDateOverlaps = true;
            }
            previousLog = log;
        });
    }

    startLogCounter(log) {
        if (this.runningLog) {
            if (this.runningLog.getKey() === log.getKey()) {
                this.runningLog = null;
            }
            this.stopLogCounter(log.getStartDate());
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
        }(log), 1000);
    }

    stopLogCounter(endDate = null) {
        this.changePageTitle();
        if (this.runningLog != null) {
            this.runningLog.setEndDate(endDate === null ? Utils.getCurrentTimestamp() : endDate);
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
