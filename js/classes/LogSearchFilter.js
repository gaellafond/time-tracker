class LogSearchFilter {
    constructor(searchStr, caseSensitive=false) {
        this.searchStr = searchStr;
        this.caseSensitive = caseSensitive;
    }

    filter(log) {
        if (this.searchStr === null || this.searchStr === "") {
            return true;
        }

        // Return true if log is between fromDate and toDate
        if (this.caseSensitive) {
            return (log.getMessage() !== null && log.getMessage().includes(this.searchStr));
        } else {
            return (log.getMessage() !== null && log.getMessage().toLowerCase().includes(this.searchStr.toLowerCase()));
        }
    }
}
