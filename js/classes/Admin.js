class Admin {

    constructor(timeTracker) {
        this.dirty = false;

        this.timeTracker = timeTracker;
        this.overlayMarkup = $(`<div class="overlay"></div>`);
        this.setLogFilter("week-0");
        this.markup = $(
        `<div class="admin-wrapper">
            <div class="admin">
                <div class="header-buttons">
                    <div>
                        <select class="filter">
                            <optgroup label="Day">
                                <option value="day-0" selected="selected">Today</option>
                                <option value="day-1">Yesterday</option>
                                <option value="day-2">2 days ago</option>
                            </optgroup>
                            <optgroup label="Week">
                                <option value="week-0" selected="selected">This week</option>
                                <option value="week-1">Last week</option>
                                <option value="week-2">2 weeks ago</option>
                            </optgroup>
                            <optgroup label="Month">
                                <option value="month-0">This month</option>
                                <option value="month-1">Last month</option>
                                <option value="month-2">2 months ago</option>
                            </optgroup>
                            <optgroup label="Year">
                                <option value="year-0">This year</option>
                                <option value="year-1">Last year</option>
                                <option value="year-2">2 years ago</option>
                            </optgroup>
                            <optgroup label="No filter">
                                <option value="">Show all</option>
                            </optgroup>
                        </select>
                    </div>
                    <button class="close">X</button>
                </div>

                <div class="time-ribbon"></div>

                <h2>Projects</h2>
                <div class="project-editor"></div>

                <div class="footer-buttons">
                    <button class="reset">RESET</button>
                    <button class="exportCSV">Export CSV</button>
                </div>
            </div>
        </div>`);

        this.markup.find("select.filter").change(function(admin) {
            return function() {
                admin.setLogFilter($(this).val());
                admin.render();
            };
        }(this));

        this.markup.find("button.close").click(function(admin) {
            return function() {
                admin.hide();
            };
        }(this));

        this.markup.find("button.reset").click(function(admin) {
            return function() {
                admin.confirmReset();
            };
        }(this));

        this.markup.find("button.exportCSV").click(function(admin) {
            return function() {
                admin.exportCSV();
            };
        }(this));

        const body = $("body");
        body.prepend(this.markup);
        body.prepend(this.overlayMarkup);

        this.adminTimeRibbon = new TimeRibbon(this.markup.find(".time-ribbon"), this.timeTracker);
        this.adminTimeRibbon.setDrawTable(true);
        this.projectEditorEl = this.markup.find(".project-editor");
    }

    setLogFilter(filterStr) {
        this.filter = null;
        if (filterStr) {
            const filterStrParts = filterStr.split("-");
             // filterType = day, week, month, year
            const filterType = filterStrParts[0];
            const filterNumberStr = filterStrParts[1];

            let filterNumber = 0;
            try {
                filterNumber = parseInt(filterNumberStr);
            } catch(err) {
                console.error("Unsupported filter number: " + filterNumberStr);
                return;
            }

            if (filterType === "day") {
                const dayStart = new Date();
                dayStart.setMilliseconds(0);
                dayStart.setSeconds(0);
                dayStart.setMinutes(0);
                dayStart.setHours(0);

                const day = dayStart.getDate() - filterNumber;
                dayStart.setDate(day);
                const startDate = Math.floor(dayStart.getTime() / 1000);

                dayStart.setDate(day+1);
                const endDate = Math.floor(dayStart.getTime() / 1000);

                this.filter = new LogFilter(startDate, endDate);

            } else if (filterType === "week") {
                const oneWeek = 7 * 24 * 60 * 60;
                const startDate = Utils.getCurrentWeekStart() - (filterNumber * oneWeek);
                const endDate = startDate + oneWeek;

                this.filter = new LogFilter(startDate, endDate);

            } else if (filterType === "month") {
                const monthStart = new Date();
                monthStart.setMilliseconds(0);
                monthStart.setSeconds(0);
                monthStart.setMinutes(0);
                monthStart.setHours(0);
                monthStart.setDate(1);

                const month = monthStart.getMonth() - filterNumber;
                monthStart.setMonth(month);
                const startDate = Math.floor(monthStart.getTime() / 1000);

                monthStart.setMonth(month+1);
                const endDate = Math.floor(monthStart.getTime() / 1000);

                this.filter = new LogFilter(startDate, endDate);

            } else if (filterType === "year") {
                const yearStart = new Date();
                yearStart.setMilliseconds(0);
                yearStart.setSeconds(0);
                yearStart.setMinutes(0);
                yearStart.setHours(0);
                yearStart.setDate(1);
                yearStart.setMonth(0);

                const year = yearStart.getFullYear() - filterNumber;
                yearStart.setFullYear(year);
                const startDate = Math.floor(yearStart.getTime() / 1000);

                yearStart.setFullYear(year+1);
                const endDate = Math.floor(yearStart.getTime() / 1000);

                this.filter = new LogFilter(startDate, endDate);

            } else {
                console.error("Unsupported filter type: " + filterType);
            }
        }
    }

    renderProjectEditor() {
        this.destroyProjectEditor();
        const projects = this.timeTracker.getProjects();

        let projectTable = $(`<table class="projects-table">
            <tr class="header">
                <th class="key">Key</th>
                <th>Name</th>
                <th>Colour code</th>
                <th class="delete-column">X</th>
            </tr>
        </table>`);
        $.each(projects, function(admin) {
            return function(projectIndex, project) {
                let projectTableRow = $(`<tr style="background-color: ${project.getBackgroundColour()}">
                    <td class="key">${project.getKey()}</td>
                    <td class="name">${Utils.escapeHTML(project.getName())}</td>
                </tr>`);

                let projectColourCellEl = $(`<td>${project.getBackgroundColourIndex()}</td>`);
                projectColourCellEl.click(function(admin, project) {
                    return function() {
                        project.setBackgroundColourIndex(project.getBackgroundColourIndex() + 1);
                        project.save();
                        admin.render();
                        admin.dirty = true;
                    };
                }(admin, project));
                projectTableRow.append(projectColourCellEl);

                let deleteCellEl = $(`<td class="delete-column"></td>`);
                let deleteCellButtonEl = $(`<button class="delete">X</button>`);
                deleteCellEl.append(deleteCellButtonEl);
                projectTableRow.append(deleteCellEl);

                deleteCellButtonEl.click(function(admin, project) {
                    return function() {
                        // NOTE: No character need escaping in a "confirm" window
                        const warningMessage =
                            "Are you sure you want to delete this project?\n" +
                            "    Project: " + project.getName()
                        if (window.confirm(warningMessage)) {
                            project.delete();
                            admin.timeTracker.reload();
                            admin.render();
                            admin.dirty = true;
                        }
                    };
                }(admin, project));

                projectTable.append(projectTableRow);

                let projectLogsRow = $(`<tr><td class="key"></td></tr>`);
                let projectLogsCell = $(`<td colspan="3" style="background-color: ${project.getBackgroundColour()}"></td>`);
                projectLogsCell.append(admin.renderProjectLogsEditor(project));

                projectLogsRow.append(projectLogsCell);
                projectTable.append(projectLogsRow);
            }
        }(this));

        this.projectEditorEl.append(projectTable);
    }

    _getTotalRow(total) {
        let totalRow = $(`<tr class="total">
            <td class="key"></td>
            <th colspan="3">TOTAL</th>
        </tr>`);

        let totalCellEl = $(`<td></td>`);
        let totalCellDataEl = $(`<span>${Utils.formatTime(total)}</span>`);
        totalCellEl.append(totalCellDataEl);

        totalRow.append(totalCellEl);

        // Filler
        totalRow.append(`<td colspan="2"></td>`);

        return totalRow;
    }

    renderProjectLogsEditor(project) {
        let logs = project.getLogs(this.filter);
        if (logs !== null && logs.length > 0) {
            let logsTable = $(`<table class="logs-table">
                <tr class="header">
                    <th class="key">Key</th>
                    <th>Weekday</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th>Time</th>
                    <th>Message</th>
                    <th class="delete-column">X</th>
                </tr>
            </table>`);

            let lastWeekNumber = null, currentWeekNumber = null;
            let lastTotalWeekNumber = null;
            let totalTime = 0;
            $.each(logs, function(admin) {
                return function(logIndex, log) {
                    if (lastWeekNumber === null) {
                        lastWeekNumber = Utils.getWeekNumber(log.getStartDate());
                    }
                    currentWeekNumber = Utils.getWeekNumber(log.getStartDate());

                    if (lastWeekNumber !== currentWeekNumber) {
                        logsTable.append(admin._getTotalRow(totalTime));
                        totalTime = 0;
                        lastTotalWeekNumber = lastWeekNumber;
                    }

                    let elapseTime = log.getElapseTime();
                    totalTime += elapseTime;

                    let logRow = $(`<tr>
                        <td class="key">${log.getKey()}</td>
                    </tr>`);

                    let weekdayCellEl = $(`<td></td>`);
                    let weekdayCellDataEl = $(`<span>${Utils.getWeekday(log.getStartDate())}</span>`);
                    weekdayCellEl.append(weekdayCellDataEl);

                    let startDateCellEl = $(`<td></td>`);
                    let startDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getStartDate())}</span>`);
                    startDateCellEl.append(startDateCellDataEl);

                    let endDateCellEl = $(`<td></td>`);
                    let endDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getEndDate())}</span>`);
                    endDateCellEl.append(endDateCellDataEl);

                    let elapseTimeCellEl = $(`<td></td>`);
                    let elapseTimeCellDataEl = $(`<span>${Utils.formatTime(elapseTime)}</span>`);
                    elapseTimeCellEl.append(elapseTimeCellDataEl);

                    let messageCellEl = $(`<td></td>`);
                    let messageCellDataEl = $(`<span>${Utils.escapeHTML(log.getMessage())}</span>`);
                    messageCellEl.append(messageCellDataEl);

                    let deleteCellEl = $(`<td class="delete-column"></td>`);
                    let deleteCellButtonEl = $(`<button class="delete">X</button>`);
                    deleteCellEl.append(deleteCellButtonEl);

                    logRow.append(weekdayCellEl);
                    logRow.append(startDateCellEl);
                    logRow.append(endDateCellEl);
                    logRow.append(elapseTimeCellEl);
                    logRow.append(messageCellEl);
                    logRow.append(deleteCellEl);

                    startDateCellDataEl.click(function(admin, log, startDateCellDataEl) {
                        return function() {
                            let startDate = log.getStartDate();
                            if (startDate != null) {
                                startDateCellDataEl.hide();

                                // Create an input field, add it in the markup after the (hidden) date
                                const inputEl = $(`<input type="text" value="${Utils.formatDateForEditor(log.getStartDate())}">`);
                                startDateCellDataEl.after(inputEl);
                                inputEl.focus(); // Put the cursor in the input field to start editing

                                const changeFunction = function(log, startDateCellDataEl, inputEl) {
                                    return function() {
                                        // Get the new project name that was typed
                                        const newDateStr = inputEl.val();
                                        const newDate = Utils.parseDateFromEditor(newDateStr);

                                        if (newDate) {
                                            // Set the new name on the markup and in the Project object
                                            startDateCellDataEl.html(Utils.escapeHTML(newDateStr));
                                            log.setStartDate(newDate);
                                            log.save();
                                            admin.render();
                                            admin.dirty = true;
                                        }

                                        // Delete the input field and show the changed title
                                        inputEl.remove();
                                        startDateCellDataEl.show();
                                    };
                                }(log, startDateCellDataEl, inputEl);

                                // Update the project name when
                                inputEl.change(changeFunction); // The user tape "enter"
                                inputEl.focusout(changeFunction); // The user click somewhere else in the page
                            }
                        };
                    }(admin, log, startDateCellDataEl));

                    endDateCellDataEl.click(function(admin, log, endDateCellDataEl) {
                        return function() {
                            let endDate = log.getEndDate();
                            if (endDate != null) {
                                endDateCellDataEl.hide();

                                // Create an input field, add it in the markup after the (hidden) date
                                const inputEl = $(`<input type="text" value="${Utils.formatDateForEditor(log.getEndDate())}">`);
                                endDateCellDataEl.after(inputEl);
                                inputEl.focus(); // Put the cursor in the input field to start editing

                                const changeFunction = function(log, endDateCellDataEl, inputEl) {
                                    return function() {
                                        // Get the new project name that was typed
                                        const newDateStr = inputEl.val();
                                        const newDate = Utils.parseDateFromEditor(newDateStr);

                                        if (newDate) {
                                            // Set the new name on the markup and in the Project object
                                            endDateCellDataEl.html(Utils.escapeHTML(newDateStr));
                                            log.setEndDate(newDate);
                                            log.save();
                                            admin.render();
                                            admin.dirty = true;
                                        }

                                        // Delete the input field and show the changed title
                                        inputEl.remove();
                                        endDateCellDataEl.show();
                                    };
                                }(log, endDateCellDataEl, inputEl);

                                // Update the project name when
                                inputEl.change(changeFunction); // The user tape "enter"
                                inputEl.focusout(changeFunction); // The user click somewhere else in the page
                            }
                        };
                    }(admin, log, endDateCellDataEl));

                    messageCellDataEl.click(function(admin, log, messageCellDataEl) {
                        return function() {
                            messageCellDataEl.hide();

                            // Create an input field, add it in the markup after the (hidden) message
                            const inputEl = $(`<input type="text" value="${Utils.escapeHTML(log.getMessage())}">`);
                            messageCellDataEl.after(inputEl);
                            inputEl.focus(); // Put the cursor in the input field to start editing

                            const changeFunction = function(log, messageCellDataEl, inputEl) {
                                return function() {
                                    // Get the new project name that was typed
                                    const newMessage = inputEl.val();

                                    // Set the new name on the markup and in the Project object
                                    messageCellDataEl.html(Utils.escapeHTML(newMessage));
                                    log.setMessage(newMessage);
                                    log.save();
                                    admin.render();
                                    admin.dirty = true;

                                    // Delete the input field and show the changed title
                                    inputEl.remove();
                                    messageCellDataEl.show();
                                };
                            }(log, messageCellDataEl, inputEl);

                            // Update the project name when
                            inputEl.change(changeFunction); // The user tape "enter"
                            inputEl.focusout(changeFunction); // The user click somewhere else in the page
                        };
                    }(admin, log, messageCellDataEl));

                    deleteCellButtonEl.click(function(admin, log) {
                        return function() {
                            // NOTE: No character need escaping in a "confirm" window
                            const warningMessage =
                                "Are you sure you want to delete this log?\n" +
                                "    Log: " + log.getMessage() + "\n" +
                                "    Project: " + log.getProject().getName()
                            if (window.confirm(warningMessage)) {
                                log.delete();
                                admin.timeTracker.reload();
                                admin.render();
                                admin.dirty = true;
                            }
                        };
                    }(admin, log));

                    logsTable.append(logRow);

                    lastWeekNumber = currentWeekNumber;
                };
            }(this));

            if (lastTotalWeekNumber !== currentWeekNumber) {
                logsTable.append(this._getTotalRow(totalTime));
            }

            return logsTable;
        }

        return null;
    }

    destroyProjectEditor() {
        this.projectEditorEl.empty();
    }

    confirmReset() {
        let confirmed = window.confirm("Are you sure you want to delete all projects and time logs?");
        if (confirmed) {
            this._reset();
        }
    }

    _reset() {
        window.localStorage.clear();
        Utils.notifyLocalStorageChange();
        location.reload();
    }

    show() {
        this.overlayMarkup.show();
        this.markup.css("display", "flex");
        this.render();
    }

    hide() {
        if (this.dirty) {
            // The user has changed something. Reload the time tracker page
            this.timeTracker.reload();
            this.dirty = false;
        }

        this.overlayMarkup.hide();
        this.markup.hide();

        this.adminTimeRibbon.destroy();
        this.destroyProjectEditor();
    }

    render() {
        this.adminTimeRibbon.render(this.filter);
        this.renderProjectEditor();
    }

    exportCSV() {
        // CSV content, starting with URI header
        let csvContent = "data:text/csv;charset=utf-8,";

        // Get data as an array and generate a CSV string from it.
        const dataArray = this.generateDataArray();
        $.each(dataArray, function(rowIndex, row) {
            let rowStr = "";
            $.each(row, function(cellIndex, cell) {
                if (rowStr) {
                    rowStr += ',';
                }
                rowStr += Utils.escapeCSV(cell);
            });
            csvContent += rowStr + "\r\n";
        });
        // Encode the URI to put it in a HREF
        const encodedUri = encodeURI(csvContent);

        // Create a link to the CSV and put it in the page markup
        let dateStr = Utils.formatDateForFilename(Utils.getCurrentTimestamp());
        let link = $(`<a href="${encodedUri}" download="time-tracker_export_${dateStr}.csv"></a>`);
        $("body").append(link);

        // Simulate a click on the link to trigger the file download
        link[0].click();

        // Remove the link from the page
        link.remove();
    }

    // Generate an array of data used to generate a CSV file
    generateDataArray() {
        const dataArray = [];
        dataArray.push(
            ["project_key", "project_name", "log_key", "log_startdate", "log_enddate", "log_message"]
        );

        $.each(this.timeTracker.getProjects(), function(projectIndex, project) {
            $.each(project.logs, function(logIndex, log) {
                dataArray.push(
                    [project.getKey(), project.getName(), log.getKey(), Utils.formatDateForCSV(log.getStartDate()), Utils.formatDateForCSV(log.getEndDate()), log.getMessage()]
                );
            });
        });

        return dataArray;
    }
}