class TimeRibbon {

    constructor(timeRibbonEl, timeTracker) {
        this.timeRibbonEl = timeRibbonEl;
        this.timeTracker = timeTracker;
    }

    static drawCell(cellLength, backgroundColour, projectName = "", logMessage = "") {
        let message = projectName ? `<span class="project-name">${TimeTracker.escapeHTML(projectName)}</span>: ${TimeTracker.escapeHTML(logMessage)}` : `${TimeTracker.escapeHTML(logMessage)}`;
        return `<div class="log" style="flex-grow:${cellLength}; background-color:${backgroundColour};" title="${TimeTracker.escapeHTML(logMessage)}"><div class=message>${message}</div></div>`;
    }

    static getSecondsInDay(timestamp) {
        let date = new Date(timestamp * 1000);
        return date.getHours() * 60 * 60 +
            date.getMinutes() * 60 +
            date.getSeconds();
    }

    render(renderedDates) {
        this._render(renderedDates);

        this.refreshInterval = window.setInterval(function(timeRibbon, renderedDates) {
            return function() {
                timeRibbon._render(renderedDates);
            };
        }(this, renderedDates), 60 * 1000);
    }

    _render(renderedDates = null) {
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
        if (renderedDates === null) {
            renderedDates = Object.keys(dates);
            renderedDates.sort();
        }

        // Sort the logs in the arrays
        // and collect the min / max timestamp
        let minSecInDay = null;
        let maxSecInDay = null;
        $.each(renderedDates, function(dateIndex, date) {
            let logArray = dates[date];
            Log.sort(logArray);

            let startSecInDay = TimeRibbon.getSecondsInDay(logArray[0].getStartDate());
            if (minSecInDay === null || startSecInDay < minSecInDay) {
                minSecInDay = startSecInDay;
            }

            let lastTimestamp = logArray[logArray.length-1].getEndDate();
            if (lastTimestamp == null) {
                lastTimestamp = Log.getCurrentTimestamp();
            }

            let endSecInDay = TimeRibbon.getSecondsInDay(lastTimestamp);
            if (maxSecInDay === null || endSecInDay > maxSecInDay) {
                maxSecInDay = endSecInDay;
            }
        });

        // Quantise to half hour (3:30, 4:30, etc)
        const hour = 60 * 60;
        let dayStart = 7.5 * hour;
        let dayEnd = 16.5 * hour;
        while (minSecInDay < dayStart) {
            dayStart -= hour;
        }
        while (maxSecInDay > dayEnd) {
            dayEnd += hour;
        }


        // Draw
        const drawTable = renderedDates.length > 1;
        this.timeRibbonEl.html(""); // Clear
        if (drawTable) {
            let tableEl = $(`<table></table>`);
            this.timeRibbonEl.append(tableEl);

            $.each(renderedDates, function(timeRibbon) {
                return function(dateIndex, date) {
                    let rowEl = $(`<tr></tr>`);
                    tableEl.append(rowEl);

                    let ribbonHeader = $(`<td class="rowHeader">${date}</td>`);
                    rowEl.append(ribbonHeader);

                    let ribbonCell = $(`<td class="ribbonCell"></td>`);
                    rowEl.append(ribbonCell);

                    let ribbon = timeRibbon.drawRibbon(dates[date], dayStart, dayEnd);
                    ribbonCell.append(ribbon);
                };
            }(this));

            let rowEl = $(`<tr class="scale"></tr>`);
            let scaleHeader = $(`<td class="rowHeader"></td>`);
            rowEl.append(scaleHeader);

            let scaleCell = $(`<td class="scaleCell"></td>`);
            rowEl.append(scaleCell);

            let scale = timeRibbon.drawScale(dayStart, dayEnd);
            scaleCell.append(scale);

            tableEl.append(rowEl);
        } else {
            $.each(renderedDates, function(timeRibbon) {
                return function(dateIndex, date) {
                    if (drawTable) {
                        let ribbonHeader = $(`<div class="rowHeader">${date}</div>`);
                        timeRibbon.timeRibbonEl.append(ribbonHeader);
                    }

                    let ribbonRow = timeRibbon.drawRibbon(dates[date], dayStart, dayEnd);
                    timeRibbon.timeRibbonEl.append(ribbonRow);
                };
            }(this));
        }
    }

    drawRibbon(logArray, dayStart, dayEnd) {
        let ribbonRow = $(`<div class="row"></div>`);
        let lastEndSecInDay = dayStart;
        $.each(logArray, function(ribbonRow) {
            return function(logIndex, log) {
                let startSecInDay = TimeRibbon.getSecondsInDay(log.getStartDate());
                let project = log.getProject();

                let endTimestamp = log.getEndDate();
                if (endTimestamp === null) {
                    endTimestamp = Log.getCurrentTimestamp();
                }
                let endSecInDay = TimeRibbon.getSecondsInDay(endTimestamp);

                // If logs overlaps (should not happen)
                if (startSecInDay < lastEndSecInDay) {
                    startSecInDay = lastEndSecInDay;
                }
                // White space at the beginning and gap in the logs (white space)
                if (startSecInDay > lastEndSecInDay) {
                    ribbonRow.append(TimeRibbon.drawCell(startSecInDay - lastEndSecInDay, "#ffffff"));
                }
                // Actual log
                ribbonRow.append(TimeRibbon.drawCell(endSecInDay - startSecInDay, project.getBackgroundColour(), project.getName(), log.getMessage()));

                lastEndSecInDay = endSecInDay;
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
        window.clearInterval(this.refreshInterval);
        this.timeRibbonEl.html("");
    }
}
