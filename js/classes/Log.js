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

        this.markup = $(`
            <div>
                <span class="time" data-logkey="${this.getKey()}" data-startdate="${this.getStartDate()}" data-enddate="">0:00:00</span> - ${this.getMessage()}
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

        // Sort projects by order
        logs.sort(function (a, b) {
            return a.getStartDate() - b.getStartDate();
        });

        return logs;
    }

    static load(timeTracker, jsonLog) {
        return new Log(
            Project.get(timeTracker, jsonLog.projectKey),
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
