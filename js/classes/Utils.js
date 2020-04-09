class Utils {
    static escapeCSV(val) {
        return '"' + val.replace(/"/g, '""') + '"';
    }

    static escapeHTML(val) {
        return val.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Log.padNumber(date.getMonth()+1) + '-' + Log.padNumber(date.getDate());
    }

    static formatDateForFilename(timestamp) {
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Log.padNumber(date.getMonth()+1) + '-' + Log.padNumber(date.getDate());
    }

    static formatDateForCSV(timestamp) {
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Log.padNumber(date.getMonth()+1) + '-' + Log.padNumber(date.getDate()) + ' ' +
            Log.padNumber(date.getHours()) + ':' + Log.padNumber(date.getMinutes()) + ':' + Log.padNumber(date.getSeconds());
    }

    static formatDateForEditor(timestamp) {
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Log.padNumber(date.getMonth()+1) + '-' + Log.padNumber(date.getDate()) + ' ' +
            Log.padNumber(date.getHours()) + ':' + Log.padNumber(date.getMinutes()) + ':' + Log.padNumber(date.getSeconds());
    }

    static parseDateFromEditor(dateStr) {
        if (dateStr === null) {
            return null;
        }

        const timestamp = Date.parse(dateStr);
        if (isNaN(timestamp)) {
            return null;
        }

        return timestamp / 1000;
    }

    static getSecondsInDay(timestamp) {
        if (timestamp === null) {
            return null;
        }

        let date = new Date(timestamp * 1000);
        return date.getHours() * 60 * 60 +
            date.getMinutes() * 60 +
            date.getSeconds();
    }
}
