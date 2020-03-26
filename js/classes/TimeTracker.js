class TimeTracker {

    constructor(dashboardEl) {
        this.dashboardEl = dashboardEl;
        this.projectMap = {};

        this.runningLog = null;
        this.runningLogInterval = null;

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
    }

    static escapeCSV(val) {
        return '"' + val.replace(/"/g, '""') + '"';
    }
    static escapeHTML(val) {
        return val.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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
                let elapse = Log.getCurrentTimestamp() - log.getStartDate();
                logEl.html(Log.formatTime(elapse));
            };
        }(log), 500);
    }

    stopLogCounter() {
        this.runningLog.setEndDate(Log.getCurrentTimestamp());
        this.runningLog.save();

        // Stop incrementing the counter on the screen
        window.clearInterval(this.runningLogInterval);
        this.runningLogInterval = null;

        this.runningLog.getProject().setActive(false);
        this.runningLog = null;
    }

    exportCSV() {
        // CSV content, starting with URI header
        let csvContent = "data:text/csv;charset=utf-8,";

        // Get data as an array and generate a CSV string from it.
        const dataArray = this.generateDataArray();
        $.each(dataArray, function(rowIndex, row) {
            let rowStr = "";
            $.each(row, function(cellIndex, cell) {
                if (rowStr) {
                    rowStr += ',';
                }
                rowStr += TimeTracker.escapeCSV(cell);
            });
            csvContent += rowStr + "\r\n";
        });
        // Encode the URI to put it in a HREF
        const encodedUri = encodeURI(csvContent);

        // Create a link to the CSV and put it in the page markup
        let dateStr = Log.formatDateForFilename(Log.getCurrentTimestamp());
        let link = $(`<a href="${encodedUri}" download="time-tracker_export_${dateStr}.csv"></a>`);
        $("body").append(link);

        // Simulate a click on the link to trigger the file download
        link[0].click();

        // Remove the link from the page
        link.remove();
    }

    // Generate an array of data used to generate a CSV file
    generateDataArray() {
        const dataArray = [];
        dataArray.push(
            ["project_key", "project_name", "log_key", "log_startdate", "log_enddate", "log_message"]
        );

        $.each(this.getProjects(), function(projectIndex, project) {
            $.each(project.logs, function(logIndex, log) {
                dataArray.push(
                    [project.getKey(), project.getName(), log.getKey(), Log.formatDateForCSV(log.getStartDate()), Log.formatDateForCSV(log.getEndDate()), log.getMessage()]
                );
            });
        });

        return dataArray;
    }
}
