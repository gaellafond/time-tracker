class LogFilter {
    constructor(fromDate, toDate) {
        this.fromDate = fromDate;
        this.toDate = toDate;
    }

    filter(log) {
        if (this.fromDate === null && this.toDate === null) {
            return true;
        }

        const _fromDate = this.fromDate === null ? Number.NEGATIVE_INFINITY : this.fromDate;
        const _toDate = this.toDate === null ? Number.POSITIVE_INFINITY : this.toDate;

        // Return true if log is between fromDate and toDate
        return (log.getStartDate() < _toDate && log.getStartDate() >= _fromDate) ||
            (log.getEndDate() <= _toDate && log.getEndDate() > _fromDate);
    }
}
