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

    static getCurrentDayStart() {
        const weekStart = new Date();
        weekStart.setMilliseconds(0);
        weekStart.setSeconds(0);
        weekStart.setMinutes(0);
        weekStart.setHours(0);

        return Math.floor(weekStart.getTime() / 1000);
    }

    static getCurrentWeekStart() {
        const weekStart = new Date();
        weekStart.setMilliseconds(0);
        weekStart.setSeconds(0);
        weekStart.setMinutes(0);
        weekStart.setHours(0);
        // getDay(): Sunday = 0, Saturday = 6
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        return Math.floor(weekStart.getTime() / 1000);
    }

    // Pad to 2 or 3 digits, default is 2
    static padNumber(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    };

    static formatTime(elapseSeconds) {
        // https://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript

        elapseSeconds = Math.floor(elapseSeconds);
        let secs = elapseSeconds % 60;
        elapseSeconds = Math.floor(elapseSeconds / 60);
        let mins = elapseSeconds % 60;
        let hrs = Math.floor(elapseSeconds / 60);

        return hrs + ':' + Utils.padNumber(mins) + ':' + Utils.padNumber(secs);
    }

    static formatDate(timestamp) {
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Utils.padNumber(date.getMonth()+1) + '-' + Utils.padNumber(date.getDate());
    }

    static formatDateForFilename(timestamp) {
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Utils.padNumber(date.getMonth()+1) + '-' + Utils.padNumber(date.getDate());
    }

    static formatDateForCSV(timestamp) {
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Utils.padNumber(date.getMonth()+1) + '-' + Utils.padNumber(date.getDate()) + ' ' +
            Utils.padNumber(date.getHours()) + ':' + Utils.padNumber(date.getMinutes()) + ':' + Utils.padNumber(date.getSeconds());
    }

    static formatDateForEditor(timestamp) {
        if (timestamp === null) {
            return "";
        }

        let date = new Date(timestamp * 1000);

        return date.getFullYear() + '-' + Utils.padNumber(date.getMonth()+1) + '-' + Utils.padNumber(date.getDate()) + ' ' +
            Utils.padNumber(date.getHours()) + ':' + Utils.padNumber(date.getMinutes()) + ':' + Utils.padNumber(date.getSeconds());
    }

    static parseDate(dateStr) {
        if (dateStr === null) {
            return null;
        }

        const timestamp = Date.parse(dateStr);
        if (isNaN(timestamp)) {
            return null;
        }

        return Math.floor(timestamp / 1000);
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

    static notifyLocalStorageChange() {
        if (!window.storageEvent) {
            window.storageEvent = new Event("localStorageChange");
        }

        window.dispatchEvent(window.storageEvent);
    }

    // Approximate local storage usage, in bytes
    static getLocalStorageUsedBytes() {
        // x2 because JS store strings as UTF16
        return JSON.stringify(window.localStorage).length * 2;
    }

    // Approximate space left on local storage, in bytes
    static getLocalStorageRemainingSpace() {
        // NOTE: IE has a window.localStorage.remainingSpace property, but other browsers do not yet have it.
        if (window.localStorage.hasOwnProperty("remainingSpace")) {
            return window.localStorage.remainingSpace;
        }

        // Approximate total space on local storage (10MB)
        const totalStorage = 10 * 1024 * 1024;
        return Math.max(0, totalStorage - Utils.getLocalStorageUsedBytes());
    }

    // Create a file on the user's computer
    //     create backup, save CSV, etc
    static download(content, filename, type) {
        // NOTE: Use Blob object instead of encoded URL (encodeURI) to not be restricted by URL max length (about 20kB)
        //     https://developer.mozilla.org/en-US/docs/Web/API/Blob
        // Blob max size seems to be in order of GB, which should never be an issue with this application
        // since localstorage is limited to 10MB.
        const blob = new Blob([content], {type : type});
        const url = URL.createObjectURL(blob);

        // Create a link to the CSV and put it in the page markup
        let link = $(`<a download="${filename}"></a>`);
        link.attr("href", url);
        $("body").append(link);

        // Simulate a click on the link to trigger the file download
        link[0].click();

        // Remove the link from the page
        link.remove();

        URL.revokeObjectURL(url);
    }

    // Upload a file from the user's computer
    //     restore backup, etc
    static upload(type, callback) {
        const uploadFile = $(`<input type="file" id="upload" accept="${type}">`);

        uploadFile.on("change", function(uploadFile) {
            return function() {
                const selectedFile = uploadFile[0].files[0];

                const reader = new FileReader();
                reader.onload = function() {
                    return function(e) {
                        callback(e.target.result);
                    };
                }();
                reader.readAsText(selectedFile);
            };
        }(uploadFile));

        uploadFile.trigger('click');
    }
}
