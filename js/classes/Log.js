class Log extends PersistentObject {
    constructor(projectName, message, startDate, endDate) {
        super(Log.getKeyPrefix(projectName));
        this.projectName = projectName;
        this.message = message;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    static getKeyPrefix(projectName) {
        return "log_" + projectName + "_";
    }

    static getAll(projectName) {
    }

    getProjectName() {
        return this.projectName;
    }
    setProjectName(projectName) {
        // TODO
        this.projectName = projectName;
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
            "projectName": this.projectName,
            "message": this.message,
            "startDate": this.startDate,
            "endDate": this.endDate
        }
    }
}
