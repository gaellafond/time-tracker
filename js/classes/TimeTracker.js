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

        this.categoryMap = {};

        this.runningLog = null;
        this.runningLogInterval = null;

        this.pausePage = new PausePage(this);
        this.admin = new Admin(this);

        this.uncategorisedCategory = new Category(this, "Uncategorised", 0, "UNCATEGORISED");
        this.uncategorisedCategory.setCategoryClass("new-category");
        const uncategorisedCategoryMarkup = this.uncategorisedCategory.getMarkup();

        this.dashboardEl.append(uncategorisedCategoryMarkup);

        this.newProjectBox =
            $(`<div class="new-project" id="new-project">
                <div class="buttons"><button class="new">New Project</button></div>
            </div>`);

        this.newProjectBox.find("button.new").click(function(timeTracker) {
            return function() {
                // Determine project colour.
                // To ensure a good colour rolling, set it to "total number of project" + 1
                let colourIndex = 1;
                const projects = timeTracker.getProjects();
                if (projects !== null && projects.length > 0) {
                    colourIndex = projects.length + 1;
                }

                // Set project order to be the last one in the "Uncategorised" category,
                // since that's the category new projects appears.
                let projectOrder = timeTracker.uncategorisedCategory.getHigherProjectOrder() + 1;

                let newProject = new Project(timeTracker, "New project", null, colourIndex, projectOrder, true);
                newProject.save();
                timeTracker.addProject(newProject);
                timeTracker.reloadCategoriesMarkup();
            };
        }(this));

        uncategorisedCategoryMarkup.append(this.newProjectBox);

        this.reloadCategories();
        this.reloadCategoriesMarkup();

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

    getHigherCategoryOrder() {
        let higherOrder = 0;
        $.each(this.categoryMap, function(categoryKey, category) {
            if (category.getOrder() > higherOrder) {
                higherOrder = category.getOrder();
            }
        });

        return higherOrder;
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
        this.reloadCategories();
        this.reloadCategoriesMarkup();

        this.todayTimeRibbon.render([this.todayTimeRibbonFilter]);
    }

    reloadCategories() {
        this.categoryMap = {};
        this.addCategory(this.uncategorisedCategory);

        let jsonCategories = PersistentObject.getAllJSON(Category.keyPrefix);
        jsonCategories.forEach(jsonCategory => {
            this.addCategory(Category.load(this, jsonCategory));
        });

        this.reloadProjects();
    }
    reloadProjects() {
        let jsonProjects = PersistentObject.getAllJSON(Project.keyPrefix);
        jsonProjects.forEach(jsonProject => {
            this.addProject(Project.load(this, jsonProject));
        });

        this.loadProjectsLogs();
    }

    addCategory(category) {
        this.categoryMap[category.getKey()] = category;
    }

    getCategoryMap() {
        return this.categoryMap;
    }

    getCategories() {
        // Return an array of categories, ordered my "order"
        return TimeTracker.sortCategoryArray(Object.values(this.categoryMap));
    }

    getCategory(categoryKey) {
        const category = this.categoryMap[categoryKey];
        return category ? category : this.uncategorisedCategory;
    }

    addProject(project) {
        let categoryKey = project.getCategoryKey();
        let category = categoryKey ? this.categoryMap[categoryKey] : null;
        if (!category) {
            category = this.uncategorisedCategory;
        }

        category.addProject(project);
    }

    getProjectMap() {
        const projectMap = {};
        $.each(this.categoryMap, function(categoryKey, category) {
            $.each(category.getProjectMap(), function(projectKey, project) {
                projectMap[projectKey] = project;
            });
        });
        return projectMap;
    }

    getProjects() {
        let projectList = [];
        $.each(this.getCategories(), function(categoryIndex, category) {
            $.each(category.getProjects(), function(projectIndex, project) {
                projectList.push(project);
            });
        });

        return projectList;
    }

    getSelectedProjects() {
        // Return an array of selected projects, ordered my "order"
        const projects = [];
        $.each(this.categoryMap, function(categoryKey, category) {
            $.each(category.getProjectMap(), function(projectKey, project) {
                if (project.isSelected()) {
                    projects.push(project);
                }
            });
        });
        return TimeTracker.sortProjectArray(projects);
    }

    static sortProjectArray(projects) {
        // Sort projects by order
        projects.sort(function (a, b) {
            return a.getOrder() - b.getOrder();
        });

        return projects;
    }

    static sortCategoryArray(categories) {
        // Sort categories by order
        categories.sort(function (a, b) {
            return a.getOrder() - b.getOrder();
        });

        return categories;
    }

    // Used to auto fix order after drag n drop, delete project, etc
    fixProjectOrder() {
        this.fixDatabaseOrder();
        this.reloadCategoriesMarkup();
    }

    // NOTE: If the app has no bug, this will do nothing.
    fixDatabaseOrder() {
        let changed = false;
        $.each(this.getCategories(), function(categoryIndex, category) {
            // NOTE: No need for "+1" here.
            //     "Uncategorised" category is at order 0 and is expected to stay at 0.
            let expectedCatOrder = categoryIndex;
            if (category.getOrder() !== expectedCatOrder) {
                category.setOrder(expectedCatOrder);
                category.save();
                changed = true;
            }

            $.each(category.getProjects(), function(index, project) {
                let expectedOrder = index + 1;
                if (project.getOrder() !== expectedOrder) {
                    project.setOrder(expectedOrder);
                    project.save();
                    changed = true;
                }
            });
        });

        return changed;
    }

    // Used to re-order project after a drag n drop
    reloadCategoriesMarkup() {
        // Remove all category
        this.dashboardEl.find(".category").remove();

        const categories = this.getCategories();
        $.each(categories, function(timeTracker) {
            return function(index, category) {
                if (!category.isUncategoriseCategory()) {
                    category.deleteMarkup();
                }
                // Insert the JQuery element to the page Markup
                timeTracker.dashboardEl.append(category.getMarkup());
                category.reloadProjectsMarkup();
            };
        }(this));
    }

    getProject(projectKey) {
        let project = null;
        $.each(this.categoryMap, function(categoryKey, category) {
            let projectMap = category.getProjectMap();
            if (projectMap.hasOwnProperty(projectKey)) {
                project = projectMap[projectKey];
                return true;
            }
        });
        return project;
    }

    loadProjectsLogs() {
        $.each(this.categoryMap, function(categoryKey, category) {
            $.each(category.getProjectMap(), function(projectKey, project) {
                project.loadLogs();
            });
        });

        this.flagOverlappingLogs();
    }

    flagOverlappingLogs() {
        const allLogs = {}; // Array of all logs, used to flag overlapping dates
        $.each(this.categoryMap, function(categoryKey, category) {
            $.each(category.getProjectMap(), function(projectKey, project) {
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
