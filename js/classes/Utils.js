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

    static getWeekday(timestamp, abbreviation = false) {
        // https://www.w3schools.com/jsref/jsref_getday.asp
        // Sunday is 0, Monday is 1, and so on.
        const weekdays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];
        const abbreviatedWeekdays = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
        ];

        if (timestamp === null) {
            return null;
        }

        const date = new Date(timestamp * 1000);
        if (!date) {
            return null;
        }

        const weekdayInt = date.getDay();
        if (weekdayInt < 0 || weekdayInt > 6) {
            return null;
        }

        return abbreviation ? abbreviatedWeekdays[weekdayInt] : weekdays[weekdayInt];
    }

    // Found here:
    //     https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
    static getWeekNumber(timestamp) {
        let date = new Date(timestamp * 1000);
        let onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil( (((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7 );
    }
}
