class Log extends PersistentObject {
    constructor(project, message, startDate, endDate, key=null) {
        if (key === null) {
            super(Log.getKeyPrefix(project.getKey()), false);
            console.log("CREATING LOG: " + this.getKey());
        } else {
            super(key, true);
            console.log("LOADING LOG: " + this.getKey());
        }


        super(Log.getKeyPrefix(project.getKey()), load);
        this.project = project;
        this.message = message;
        this.startDate = startDate;
        this.endDate = endDate;

        this.markup = $(`
            <div>
                <span class="time" data-logkey="${this.getKey()}" data-startdate="${this.getStartDate()}" data-enddate="">0:00:00</span> - ${this.getMessage()}
            </div>
        `);
    }

    static getKeyPrefix(projectKey) {
        return "log_" + projectKey + "_";
    }

    static getAll(projectKey) {
        let jsonLogs = PersistentObject.getAllJSON(Log.getKeyPrefix(projectKey));

        let logs = [];
        jsonLogs.forEach(jsonLog => {
            logs.push(Log.load(jsonLog));
        });

        // Sort projects by order
        logs.sort(function (a, b) {
            return a.getStartDate() - b.getStartDate();
        });

        return logs;
    }

    static load(jsonLog) {
        return new Log(
            Project.get(jsonLog.projectKey),
            jsonLog.message,
            Log.parseTime(jsonLog.startDate),
            Log.parseTime(jsonLog.endDate),
            jsonLog.key
        );
    }

    static getCurrentTimestamp() {
        return Math.floor(new Date() / 1000);
    }

    static formatTime(s) {
        // https://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript

        // Pad to 2 or 3 digits, default is 2
        let pad = function(n, z) {
            z = z || 2;
            return ('00' + n).slice(-z);
        };

        s = Math.floor(s);
        let secs = s % 60;
        s = Math.floor(s / 60);
        let mins = s % 60;
        let hrs = Math.floor(s / 60);

        return hrs + ':' + pad(mins) + ':' + pad(secs);
    }

    static parseTime(str) {
        if (str === null || str === "") {
            return null;
        }

        // TODO!!
    }

    getMarkup() {
        return this.markup;
    }

    startCounter() {
        let logEl = this.markup.find(".time");

        if (Log.runningLog) {
            Log.stopCounter();
        }
        Log.runningLog = this;
        this.project.setActive(true);

        Log.runningInterval = window.setInterval(function(log) {
            return function() {
                let elapse = Log.getCurrentTimestamp() - log.getStartDate();
                logEl.html(Log.formatTime(elapse));
            };
        }(this), 500);
    }
    static stopCounter() {
        // Stop incrementing the counter on the screen
        window.clearInterval(Log.runningInterval);
        Log.runningInterval = null;

        // Save stop time in DB
        let logKey = Log.runningLog.getKey();

        Log.runningLog.getProject().setActive(false);
        Log.runningLog = null;
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

Log.runningLog = null;
Log.runningInterval = null;
