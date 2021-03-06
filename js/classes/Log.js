class Log extends PersistentObject {
    constructor(project, message, startDate, endDate, key=null) {
        if (key === null) {
            super(Log.getKeyPrefix(project.getKey()), false);
        } else {
            super(key, true);
        }

        this.project = project;
        this.message = message;
        this.startDate = startDate;
        this.endDate = endDate;

        this.startDateOverlaps = false;
        this.endDateOverlaps = false;

        const elapse = this.getElapseTime();
        this.markup = $(`
            <div title="${Utils.escapeHTML(this.getMessage())}">
                <span class="time" data-logkey="${this.getKey()}">${Utils.formatTime(elapse)}</span> - <span class="message">${Utils.escapeHTML(this.getMessage())}</span>
            </div>
        `);
    }

    static getKeyPrefix(projectKey) {
        return "log_" + projectKey + "_";
    }

    static getAll(timeTracker, projectKey) {
        let jsonLogs = PersistentObject.getAllJSON(Log.getKeyPrefix(projectKey));

        let logs = [];
        jsonLogs.forEach(function(jsonLog) {
            logs.push(Log.load(timeTracker, jsonLog));
        });

        Log.sort(logs);

        return logs;
    }

    static sort(logArray) {
        if (logArray) {
            logArray.sort(function (a, b) {
                return a.getStartDate() - b.getStartDate();
            });
        }
    }

    static load(timeTracker, jsonLog) {
        return new Log(
            timeTracker.getProject(jsonLog.projectKey),
            jsonLog.message,
            jsonLog.startDate,
            jsonLog.endDate,
            jsonLog.key
        );
    }

    addEventListeners() {
        // Add click event on log name (edit)
        const editableLogMessage = new EditableString(this.markup.find("span.message"), function(log) {
            return function(oldValue, newValue) {
                log.markup.prop('title', newValue);
                log.setMessage(newValue);
                log.save();
            };
        }(this));
        editableLogMessage.setAutoSelect(true);
        editableLogMessage.setInputCssClass("message");
    }

    getMarkup() {
        return this.markup;
    }

    getProject() {
        return this.project;
    }

    setProject(project) {
        this.project = project;

        // Change log ID (because it contains reference to its project)
        this.delete();
        this.key = PersistentObject.getUniqueKey(Log.getKeyPrefix(project.getKey()));
        this.save();
    }

    getMessage() {
        return this.message;
    }
    setMessage(message) {
        this.message = message;
    }

    getStartDate() {
        return this.startDate;
    }
    setStartDate(startDate) {
        this.startDate = startDate;
    }

    getEndDate() {
        return this.endDate;
    }
    setEndDate(endDate) {
        this.endDate = endDate;
    }

    getElapseTime() {
        return (this.endDate ? this.endDate : Utils.getCurrentTimestamp()) - this.startDate;
    }

    isStartDateOverlaps() {
        return this.startDateOverlaps;
    }
    isEndDateOverlaps() {
        return this.endDateOverlaps;
    }

    toJson() {
        return {
            "key": this.getKey(),
            "projectKey": this.project ? this.project.getKey() : null,
            "message": this.message,
            "startDate": this.startDate,
            "endDate": this.endDate
        }
    }
}
