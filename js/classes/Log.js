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

        const elapse = this.getElapseTime();
        this.markup = $(`
            <div>
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
        this.markup.find("span.message").click(function(log) {
            return function() {
                // Hide the title (it will be replaced with a input field)
                const messageEl = $(this);
                messageEl.hide();

                // Create an input field, add it in the markup after the (hidden) title
                const inputEl = $(`<input class="message" type="text" value="${Utils.escapeHTML(log.getMessage())}">`);
                messageEl.after(inputEl);
                inputEl.select(); // Select the text in the text field

                const changeFunction = function(log, inputEl) {
                    return function() {
                        // Get the new project name that was typed
                        const newMessage = inputEl.val();

                        // Set the new name on the markup and in the Project object
                        messageEl.html(Utils.escapeHTML(newMessage));
                        log.setMessage(newMessage);
                        log.save();

                        // Delete the input field and show the changed title
                        inputEl.remove();
                        messageEl.show();
                    };
                }(log, inputEl);

                // Update the project name when
                inputEl.change(changeFunction); // The user tape "enter"
                inputEl.focusout(changeFunction); // The user click somewhere else in the page
            };
        }(this));
    }

    getMarkup() {
        return this.markup;
    }

    getProject() {
        return this.project;
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

    toJson() {
        return {
            "key": this.getKey(),
            "projectKey": this.project.getKey(),
            "message": this.message,
            "startDate": this.startDate,
            "endDate": this.endDate
        }
    }
}
