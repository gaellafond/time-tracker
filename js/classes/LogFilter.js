class LogFilter {
    constructor(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    filter(log) {
        // Return true if log is between startDate and endDate
        return (log.getStartDate() < this.endDate && log.getStartDate() >= this.startDate) ||
            (log.getEndDate() <= this.endDate && log.getEndDate() > this.startDate);
    }
}
