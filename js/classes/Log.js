class Log extends PersistentObject {
    constructor(project, message, startDate, endDate, key=null) {
        if (key === null) {
            super(Log.getKeyPrefix(project.getKey()), false);
            console.log("CREATING LOG: " + this.getKey());
        } else {
            super(key, true);
            console.log("LOADING LOG: " + this.getKey());
        }

        this.project = project;
        this.message = message;
        this.startDate = startDate;
        this.endDate = endDate;

        const elapse = (this.endDate ? this.endDate : Log.getCurrentTimestamp()) - this.startDate;
        this.markup = $(`
            <div>
                <span class="time" data-logkey="${this.getKey()}">${Log.formatTime(elapse)}</span> - <span class="message">${this.getMessage()}</span>
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
        logArray.sort(function (a, b) {
            return a.getStartDate() - b.getStartDate();
        });
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

    static getCurrentTimestamp() {
        return Math.floor(new Date() / 1000);
    }

    static formatTime(elapseSeconds) {
        // https://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript

        elapseSeconds = Math.floor(elapseSeconds);
        let secs = elapseSeconds % 60;
        elapseSeconds = Math.floor(elapseSeconds / 60);
        let mins = elapseSeconds % 60;
        let hrs = Math.floor(elapseSeconds / 60);

        return hrs + ':' + Log.padNumber(mins) + ':' + Log.padNumber(secs);
    }

    static formatDate(timestamp) {
        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Log.padNumber(date.getMonth()+1) + '-' + Log.padNumber(date.getDate());
    }

    static formatDateForFilename(timestamp) {
        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Log.padNumber(date.getMonth()+1) + '-' + Log.padNumber(date.getDate());
    }

    static formatDateForCSV(timestamp) {
        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Log.padNumber(date.getMonth()+1) + '-' + Log.padNumber(date.getDate()) + ' ' +
            Log.padNumber(date.getHours()) + ':' + Log.padNumber(date.getMinutes()) + ':' + Log.padNumber(date.getSeconds());
    }

    // Pad to 2 or 3 digits, default is 2
    static padNumber(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    };

    addEventListeners() {
        // Add click event on log name (edit)
        this.markup.find("span.message").click(function(log) {
            return function() {
                // Hide the title (it will be replaced with a input field)
                const messageEl = $(this);
                messageEl.hide();

                // Create an input field, add it in the markup after the (hidden) title
                const inputEl = $(`<input class="message" type="text" value="${log.getMessage()}">`);
                messageEl.after(inputEl);
                inputEl.select(); // Select the text in the text field

                const changeFunction = function(log, inputEl) {
                    return function() {
                        // Get the new project name that was typed
                        const newMessage = inputEl.val();

                        // Set the new name on the markup and in the Project object
                        messageEl.html(newMessage);
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
