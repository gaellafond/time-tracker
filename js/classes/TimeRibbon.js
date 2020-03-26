class TimeRibbon {

    constructor(timeRibbonEl, timeTracker) {
        this.timeRibbonEl = timeRibbonEl;
        this.timeTracker = timeTracker;

        this.render();

        this.refreshInterval = window.setInterval(function(timeRibbon) {
            return function() {
                timeRibbon.render();
            };
        }(this), 60 * 1000);
    }

    static addCell(row, cellLength, backgroundColour, projectName = "", logMessage = "") {
        let message = projectName ? `<span class="project-name">${TimeTracker.escapeHTML(projectName)}</span>: ${TimeTracker.escapeHTML(logMessage)}` : `${TimeTracker.escapeHTML(logMessage)}`;
        row.append(`<div class="log" style="flex-grow:${cellLength}; background-color:${backgroundColour};" title="${TimeTracker.escapeHTML(logMessage)}"><div class=message>${message}</div></div>`);
    }

    render() {
        let dates = {};

        // Collect all logs from all projects
        // and store them in an array per date
        const projectMap = this.timeTracker.getProjectMap();
        $.each(projectMap, function(projectKey, project) {
            $.each(project.getLogs(), function(logIndex, log) {
                let date = Log.formatDate(log.getStartDate())

                if (!dates[date]) {
                    dates[date] = [];
                }
                dates[date].push(log);
            });
        });

        // Get the list of dates and sort them
        let dateArray = Object.keys(dates);
        dateArray.sort();

        let getSecondsInDay = function(timestamp) {
            let date = new Date(timestamp * 1000);
            return date.getHours() * 60 * 60 +
                date.getMinutes() * 60 +
                date.getSeconds();
        };

        // Sort the logs in the arrays
        // and collect the min / max timestamp
        let minSecInDay = null;
        let maxSecInDay = null;
        $.each(dateArray, function(dateIndex, date) {
            let logArray = dates[date];
            Log.sort(logArray);

            let startSecInDay = getSecondsInDay(logArray[0].getStartDate());
            if (minSecInDay === null || startSecInDay < minSecInDay) {
                minSecInDay = startSecInDay;
            }

            let lastTimestamp = logArray[logArray.length-1].getEndDate();
            if (lastTimestamp == null) {
                lastTimestamp = Log.getCurrentTimestamp();
            }

            let endSecInDay = getSecondsInDay(lastTimestamp);
            if (maxSecInDay === null || endSecInDay > maxSecInDay) {
                maxSecInDay = endSecInDay;
            }
        });

        // Draw
        this.timeRibbonEl.html(""); // Clear
        $.each(dateArray, function(timeRibbon) {
            return function(dateIndex, date) {
                let ribbonHeader = $(`<div class="rowHeader">${date}</div>`);
                timeRibbon.timeRibbonEl.append(ribbonHeader);

                let ribbonRow = $(`<div class="row"></div>`);
                timeRibbon.timeRibbonEl.append(ribbonRow);

                let logArray = dates[date];
                let lastEndSecInDay = minSecInDay;
                $.each(logArray, function(ribbonRow) {
                    return function(logIndex, log) {
                        let startSecInDay = getSecondsInDay(log.getStartDate());
                        let project = log.getProject();

                        let endTimestamp = log.getEndDate();
                        if (endTimestamp === null) {
                            endTimestamp = Log.getCurrentTimestamp();
                        }
                        let endSecInDay = getSecondsInDay(endTimestamp);

                        // If logs overlaps (should not happen)
                        if (startSecInDay < lastEndSecInDay) {
                            startSecInDay = lastEndSecInDay;
                        }
                        // White space at the beginning and gap in the logs (white space)
                        if (startSecInDay > lastEndSecInDay) {
                            TimeRibbon.addCell(ribbonRow, startSecInDay - lastEndSecInDay, "#ffffff");
                        }
                        // Actual log
                        TimeRibbon.addCell(ribbonRow, endSecInDay - startSecInDay, project.getBackgroundColour(), project.getName(), log.getMessage());

                        lastEndSecInDay = endSecInDay;
                    };
                }(ribbonRow));
                // White space at the end
                if (lastEndSecInDay < maxSecInDay) {
                    TimeRibbon.addCell(ribbonRow, maxSecInDay - lastEndSecInDay, "#ffffff");
                }
            };
        }(this));
    }
}
