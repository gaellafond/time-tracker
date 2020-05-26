class Project extends PersistentObject {
    constructor(timeTracker, name, colourIndex, order, key=null) {
        if (key === null) {
            super(Project.keyPrefix, false);
        } else {
            super(key, true);
        }

        this.timeTracker = timeTracker;
        this.name = name;
        this.colourIndex = colourIndex;
        this.order = order;
        this.logs = [];

        // Create the JQuery element
        this.markup = $(`
            <div class="project" draggable="true" data-projectkey="${this.getKey()}" style="background-color: ${this.getBackgroundColour()}">
                <h2 class="title">${Utils.escapeHTML(this.getName())}</h2>
                <div class="logs"></div>
                <div class="buttons"><button class="start">Start</button></div>
            </div>
        `);
    }

    static get keyPrefix() {
        return "project";
    }

    static getProjectColours() {
        // Colour names inspired from:
        //     https://www.htmlcsscolor.com/
        return [
            {
                "backgroundColour": "#ccffff",
                "label": "Cyan"
            }, {
                "backgroundColour": "#ccccff",
                "label": "Lavender"
            }, {
                "backgroundColour": "#ffccff",
                "label": "Snuff"
            }, {
                "backgroundColour": "#ffcccc",
                "label": "Cosmos"
            }, {
                "backgroundColour": "#ffffcc",
                "label": "Cream"
            }, {
                "backgroundColour": "#ccffcc",
                "label": "Green"
            }, {
                "backgroundColour": "#cccccc",
                "label": "Grey"
            }, {
                "backgroundColour": "#e6ffff",
                "label": "Light Cyan"
            }, {
                "backgroundColour": "#e6ccff",
                "label": "Blue Chalk"
            }, {
                "backgroundColour": "#e6cccc",
                "label": "Vanilla Ice"
            }, {
                "backgroundColour": "#e6ffcc",
                "label": "Snow Flurry"
            }, {
                "backgroundColour": "#ffe6ff",
                "label": "Selago"
            }, {
                "backgroundColour": "#cce6ff",
                "label": "Pattens Blue"
            }, {
                "backgroundColour": "#cce6cc",
                "label": "Granny Apple"
            }, {
                "backgroundColour": "#ffe6cc",
                "label": "Bisque"
            }, {
                "backgroundColour": "#ffffe6",
                "label": "Light Yellow"
            }, {
                "backgroundColour": "#ccffe6",
                "label": "White Ice"
            }, {
                "backgroundColour": "#cccce6",
                "label": "Quartz"
            }, {
                "backgroundColour": "#ffcce6",
                "label": "Classic Rose"
            }
        ];
    }

    static getProjectColour(colourIndex) {
        const colours = Project.getProjectColours();
        return colours[colourIndex % colours.length];
    }

    static getBackgroundColour(colourIndex) {
        return Project.getProjectColour(colourIndex).backgroundColour;
    }

    static load(timeTracker, jsonProject) {
        return new Project(
            timeTracker,
            jsonProject.name,
            jsonProject.colourIndex !== undefined ? jsonProject.colourIndex : jsonProject.bgColourIndex,
            jsonProject.order,
            jsonProject.key
        );
    }

    loadLogs() {
        this.logs = Log.getAll(this.timeTracker, this.getKey());

        const logsEl = this.markup.find(".logs");
        let lastLog = null;
        $.each(this.logs, function(project, logsEl) {
            return function(index, log) {
                project.addLogDate(lastLog, log);
                logsEl.append(log.getMarkup());

                if (log.getEndDate() === null) {
                    project.timeTracker.startLogCounter(log);
                }

                lastLog = log;
            };
        }(this, logsEl));
    }

    addEventListeners() {
        // Drag and drop events
        // See: https://www.w3schools.com/html/html5_draganddrop.asp

        // Save dragged project key in the event
        // this = dragged project
        this.markup.on("dragstart", function(draggedProject) {
            return function(event) {
                event.originalEvent.dataTransfer.setData("text", draggedProject.getKey());
            };
        }(this));

        // Tell the browser the project can be dropped on another project
        // this = project under the dragged project
        this.markup.on("dragover", function(event) {
            event.preventDefault();
        });

        // The dragged project was drop on another project
        // this = drop on project
        this.markup.on("drop", function(dropOnProject) {
            return function(event) {
                event.preventDefault();
                const draggedProjectKey = event.originalEvent.dataTransfer.getData("text");
                const draggedProject = dropOnProject.timeTracker.getProject(draggedProjectKey);

                draggedProject.moveOn(dropOnProject);
            };
        }(this));

        // Add click event on start button
        this.markup.find("button.start").click(function(project) {
            return function() {
                project.addLog();
            };
        }(this));

        // Add click event on title (edit)
        const editableProjectTitle = new EditableString(this.markup.find("h2.title"), function(project) {
            return function(newValue) {
                project.setName(newValue);
                project.save();
            };
        }(this));
        editableProjectTitle.setAutoSelect(true);
        editableProjectTitle.setInputCssClass("title");

        $.each(this.logs, function(index, log) {
            log.addEventListeners();
        });
    }

    moveOn(dropOnProject) {
        if (dropOnProject !== this) {
            const draggedProjectOrder = this.getOrder();
            const dropOnProjectOrder = dropOnProject.getOrder();
            const newOrder = dropOnProjectOrder;
            if (draggedProjectOrder > dropOnProjectOrder) {
                $.each(this.timeTracker.getProjectMap(), function(projectKey, project) {
                    let projectOrder = project.getOrder();
                    if (projectOrder >= dropOnProjectOrder && projectOrder < draggedProjectOrder) {
                        project.setOrder(projectOrder + 1);
                        project.save();
                    }
                });
            } else if (draggedProjectOrder < dropOnProjectOrder) {
                $.each(this.timeTracker.getProjectMap(), function(projectKey, project) {
                    let projectOrder = project.getOrder();
                    if (projectOrder <= dropOnProjectOrder && projectOrder > draggedProjectOrder) {
                        project.setOrder(projectOrder - 1);
                        project.save();
                    }
                });
            }
            this.setOrder(newOrder);
            this.save();

            this.timeTracker.fixProjectOrder();
        }
    }

    addLog() {
        const lastLog = this.getLastLog();
        const log = new Log(this, this.guessNextLogName(), Utils.getCurrentTimestamp(), null);
        log.save();
        this.logs.push(log);

        this.addLogDate(lastLog, log);
        this.markup.find(".logs").append(log.getMarkup());
        log.addEventListeners();

        this.timeTracker.startLogCounter(log);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const logsEl = this.markup.find(".logs");
        logsEl.prop("scrollTop", logsEl.prop("scrollHeight"));
    }

    addLogDate(previousLog, log) {
        let logDate = null;
        if (previousLog === null) {
            logDate = Utils.formatDate(log.getStartDate());
        } else {
            const previousDateStr = Utils.formatDate(previousLog.getStartDate());
            const currentDateStr = Utils.formatDate(log.getStartDate());
            if (previousDateStr !== currentDateStr) {
                logDate = currentDateStr;
            }
        }

        if (logDate !== null) {
            this.markup.find(".logs").append(`<div class="date">${logDate}</div>`);
        }
    }

    getLogs(logFilter) {
        if (!logFilter) {
            return this.logs;
        }

        const filteredLogs = [];
        $.each(this.logs, function(logIndex, log) {
            if (logFilter.filter(log)) {
                filteredLogs.push(log);
            }
        });

        return filteredLogs;
    }

    getMarkup() {
        return this.markup;
    }

    setActive(active) {
        if (active) {
            this.markup.addClass('active');
        } else {
            this.markup.removeClass('active');
        }
    }
    isActive() {
        this.markup.hasClass('active');
    }

    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }

    getLastLog() {
        if (this.logs !== null && this.logs.length > 0) {
            return this.logs[this.logs.length - 1];
        }
        return null;
    }

    guessNextLogName() {
        const lastLog = this.getLastLog();
        if (lastLog !== null) {
            return lastLog.getMessage();
        }
        return this.name;
    }

    getColourIndex() {
        return this.colourIndex;
    }
    getColour() {
        return Project.getProjectColour(this.colourIndex);
    }
    setColourIndex(colourIndex) {
        const colours = Project.getProjectColours();
        this.colourIndex = colourIndex % colours.length;
    }

    getBackgroundColour() {
        return Project.getBackgroundColour(this.colourIndex);
    }

    getOrder() {
        return this.order;
    }
    setOrder(order) {
        this.order = order;
    }

    toJson() {
        return {
            "key": this.getKey(),
            "name": this.name,
            "colourIndex": this.colourIndex,
            "order": this.order
        }
    }

    // Override
    delete() {
        $.each(this.logs, function(index, log) {
            log.delete();
        });
        super.delete();
    }
}
