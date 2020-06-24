class TimeRibbon {

    constructor(timeRibbonEl, timeTracker) {
        this.timeRibbonEl = timeRibbonEl;
        this.timeTracker = timeTracker;
        this.drawTable = false;
    }

    setDrawTable(drawTable) {
        this.drawTable = drawTable;
    }

    static drawCell(cellLength, backgroundColour, projectName = "", logMessage = "", tooltip = "") {
        let message = projectName ? `<span class="project-name">${Utils.escapeHTML(projectName)}</span>: ${Utils.escapeHTML(logMessage)}` : `${Utils.escapeHTML(logMessage)}`;
        return `<div class="log" style="flex-grow:${cellLength}; background-color:${backgroundColour};" title="${Utils.escapeHTML(logMessage)}"><div class="message" title="${tooltip}">${message}</div></div>`;
    }

    // TODO Filter instead of renderedDates
    render(filter) {
        this._render(filter);

        if (this.refreshInterval) {
            window.clearInterval(this.refreshInterval);
        }

        this.refreshInterval = window.setInterval(function(timeRibbon, filter) {
            return function() {
                timeRibbon._render(filter);
            };
        }(this, filter), 60 * 1000);
    }

    _render(filter = null) {
        // dates = Map object
        //   Key: Formatted date (used to group logs per date, sort and display)
        //   Value: Array of log objects for that date
        let dates = {};

        // Collect all logs from all projects
        // and store them in an array per date
        const projectMap = this.timeTracker.getProjectMap();
        $.each(projectMap, function(projectKey, project) {
            $.each(project.getLogs(filter), function(logIndex, log) {
                let date = Utils.formatDate(log.getStartDate())

                if (!dates[date]) {
                    dates[date] = [];
                }
                dates[date].push(log);
            });
        });

        // Get the list of dates and sort them
        const renderedDates = Object.keys(dates);
        renderedDates.sort();

        // Sort the logs in the arrays
        // and collect the min / max timestamp
        let minSecInDay = null;
        let maxSecInDay = null;
        $.each(renderedDates, function(dateIndex, date) {
            let logArray = dates[date];
            if (logArray) {
                Log.sort(logArray);

                let startSecInDay = Utils.getSecondsInDay(logArray[0].getStartDate());
                if (minSecInDay === null || startSecInDay < minSecInDay) {
                    minSecInDay = startSecInDay;
                }

                let lastTimestamp = logArray[logArray.length-1].getEndDate();
                if (lastTimestamp == null) {
                    lastTimestamp = Utils.getCurrentTimestamp();
                }

                let endSecInDay = Utils.getSecondsInDay(lastTimestamp);
                if (maxSecInDay === null || endSecInDay > maxSecInDay) {
                    maxSecInDay = endSecInDay;
                }
            }
        });

        // Quantise to half hour (3:30, 4:30, etc)
        const hour = 60 * 60;
        let dayStart = 7.5 * hour;
        let dayEnd = 17.5 * hour;
        while (minSecInDay < dayStart) {
            dayStart -= hour;
        }
        while (maxSecInDay > dayEnd) {
            dayEnd += hour;
        }


        // Draw
        this.timeRibbonEl.empty(); // Clear
        if (this.drawTable) {
            let tableEl = $(`<table></table>`);
            this.timeRibbonEl.append(tableEl);

            $.each(renderedDates, function(timeRibbon) {
                return function(dateIndex, date) {
                    let logs = dates[date];
                    let weekday = Utils.getWeekday(logs[0].getStartDate(), true);

                    let rowEl = $(`<tr></tr>`);
                    tableEl.append(rowEl);

                    let ribbonHeaderWeekday = $(`<td class="rowHeader">${weekday}</td>`);
                    rowEl.append(ribbonHeaderWeekday);

                    let ribbonHeaderDate = $(`<td class="rowHeader">${date}</td>`);
                    rowEl.append(ribbonHeaderDate);

                    let ribbonCell = $(`<td class="ribbonCell"></td>`);
                    rowEl.append(ribbonCell);

                    let ribbon = timeRibbon.drawRibbon(logs, dayStart, dayEnd);
                    ribbonCell.append(ribbon);
                };
            }(this));

            let rowEl = $(`<tr class="scale"></tr>`);
            let scaleHeader = $(`<td class="rowHeader" colspan="2"></td>`);
            rowEl.append(scaleHeader);

            let scaleCell = $(`<td class="scaleCell"></td>`);
            rowEl.append(scaleCell);

            let scale = this.drawScale(dayStart, dayEnd);
            scaleCell.append(scale);

            tableEl.append(rowEl);
        } else {
            if (!renderedDates || renderedDates.length <= 0) {
                let ribbonRow = this.drawRibbon([], dayStart, dayEnd);
                this.timeRibbonEl.append(ribbonRow);
            } else {
                $.each(renderedDates, function(timeRibbon) {
                    return function(dateIndex, date) {
                        let ribbonRow = timeRibbon.drawRibbon(dates[date], dayStart, dayEnd);
                        timeRibbon.timeRibbonEl.append(ribbonRow);
                    };
                }(this));
            }
        }
    }

    drawRibbon(logArray, dayStart, dayEnd) {
        let ribbonRow = $(`<div class="row"></div>`);
        let lastEndSecInDay = dayStart;
        $.each(logArray, function(ribbonRow) {
            return function(logIndex, log) {
                let startSecInDay = Utils.getSecondsInDay(log.getStartDate());
                let project = log.getProject();

                let endTimestamp = log.getEndDate();
                if (endTimestamp === null) {
                    endTimestamp = Utils.getCurrentTimestamp();
                }
                let endSecInDay = Utils.getSecondsInDay(endTimestamp);

                // If logs overlaps (should not happen)
                if (startSecInDay < lastEndSecInDay) {
                    startSecInDay = lastEndSecInDay;
                }

                const cellLength = endSecInDay - startSecInDay;
                const tooltip = Utils.formatTime(cellLength) + " - " + project.getName() + ": " + log.getMessage();
                if (cellLength > 0) {
                    // White space at the beginning and gap in the logs (white space)
                    if (startSecInDay > lastEndSecInDay) {
                        ribbonRow.append(TimeRibbon.drawCell(startSecInDay - lastEndSecInDay, "#ffffff"));
                    }
                    // Actual log
                    ribbonRow.append(TimeRibbon.drawCell(cellLength, project.getBackgroundColour(), project.getName(), log.getMessage(), tooltip));

                    lastEndSecInDay = endSecInDay;
                }
            };
        }(ribbonRow));
        // White space at the end
        if (lastEndSecInDay < dayEnd) {
            ribbonRow.append(TimeRibbon.drawCell(dayEnd - lastEndSecInDay, "#ffffff"));
        }

        return ribbonRow;
    }

    drawScale(dayStart, dayEnd) {
        let scaleRow = $(`<div class="row"></div>`);
        const hour = 60 * 60;
        for (let start = dayStart; start<dayEnd; start+=hour) {
            scaleRow.append(TimeRibbon.drawCell(hour, "#ffffff", null, Math.ceil(start / hour) + ":00"));
        }

        return scaleRow;
    }

    destroy() {
        if (this.refreshInterval) {
            window.clearInterval(this.refreshInterval);
        }
        this.timeRibbonEl.empty();
    }
}
