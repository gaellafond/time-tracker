class Log extends PersistentObject {
    constructor(project, message, startDate, endDate) {
        super(Log.getKeyPrefix(project.getName()), Log.getKeyPrefix(project.getName()) + formatTime(startDate));
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

    static getKeyPrefix(projectName) {
        return "log_" + projectName + "_";
    }

    static getAll(projectName) {
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
                let elapse = getCurrentTimestamp() - log.getStartDate();
                logEl.html(formatTime(elapse));
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
            "projectName": this.project.getName(),
            "message": this.message,
            "startDate": this.startDate,
            "endDate": this.endDate
        }
    }
}

Log.runningLog = null;
Log.runningInterval = null;
