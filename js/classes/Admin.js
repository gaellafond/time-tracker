class Admin {

    constructor(timeTracker) {
        this.dirty = false;

        this.timeTracker = timeTracker;
        this.overlayMarkup = $(`<div class="overlay"></div>`);
        this.setView("dateChrono");
        this.dateFilter = null;
        this.searchFilter = null;

        this.markup = $(
        `<div class="admin-wrapper">
            <div class="admin">
                <div class="header-buttons">
                    <div class="filterDate">
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
                            <optgroup label="Financial Year">
                                <option value="finyear-0">This financial year</option>
                                <option value="finyear-1">Last financial year</option>
                                <option value="finyear-2">2 financial years ago</option>
                            </optgroup>
                            <optgroup label="Other">
                                <option value="custom">Custom dates</option>
                                <option value="">Show all</option>
                            </optgroup>
                        </select>

                        Filter:
                        <span class="filterDateFrom">YYYY/MM/DD</span>
                        -
                        <span class="filterDateTo">YYYY/MM/DD</span>

                        Search:
                        <span class="filterSearch"></span>                        
                    </div>
                    <button class="close">X</button>
                </div>

                <div class="project-filter-container">
                    <h2>Project filter:</h2>
                    <div class="project-filter"></div>
                </div>

                <div class="time-ribbon"></div>

                <div class="project-editor-header">
                    <div class="viewSelector">
                        <h2>View</h2>
                        <select class="view">
                            <option value="dateChrono" selected="selected">By dates</option>
                            <option value="date">By dates, grouped by projects</option>
                            <option value="project">By projects</option>
                        </select>
                    </div>

                    <div class="timeNormalisation">
                        <h3>Time normalisation percentage</h3>
                        <span class="timeNormalisationPercentage">${Math.round(this.timeTracker.getTimeNormalisationPercentage() * 100.0)}</span>%
                    </div>
                </div>
                <div class="project-editor"></div>

                <div class="footer-buttons">
                    <button class="reset">RESET</button>
                    <div>
                        <button class="backup">Backup</button>
                        <button class="restore">Restore</button>
                        <button class="exportCSV">Export CSV</button>
                    </div>
                </div>
            </div>
        </div>`);

        this.filterSelectEl = this.markup.find("select.filter");
        this.filterSelectEl.change(function(admin) {
            return function() {
                admin.setLogDateFilter($(this).val());
                admin.render();
            };
        }(this));

        const filterDateOnChangeCallback = function(admin, newValue) {
            if (newValue !== "" && Utils.parseDate(newValue) === null) {
                return false;
            }
            admin.filterSelectEl.val("custom");
        };
        const filterDateAfterEditCallback = function(admin, newValue) {
            admin.updateFilterDates();
            admin.render();
        };

        this.filterDateFromEl = this.markup.find("span.filterDateFrom");
        const filterDateFromEditStr = new EditableString(this.filterDateFromEl,
            function(admin) {
                return function(oldValue, newValue) {
                    return filterDateOnChangeCallback(admin, newValue);
                };
            }(this),
            function(admin) {
                return function(oldValue, newValue) {
                    filterDateAfterEditCallback(admin, newValue);
                };
            }(this)
        );
        filterDateFromEditStr.setAllowEmpty(true);

        this.filterDateToEl = this.markup.find("span.filterDateTo");
        const filterDateToEditStr = new EditableString(this.filterDateToEl,
            function(admin) {
                return function(oldValue, newValue) {
                    return filterDateOnChangeCallback(admin, newValue);
                };
            }(this),
            function(admin) {
                return function(oldValue, newValue) {
                    filterDateAfterEditCallback(admin, newValue);
                };
            }(this)
        );
        filterDateToEditStr.setAllowEmpty(true);

        this.filterSearchEl = this.markup.find("span.filterSearch");
        const filterSearchEditStr = new EditableString(this.filterSearchEl,
            function(admin) {
                return function(oldValue, newValue) {
                    admin.updateFilterSearch(newValue);
                };
            }(this),
            null,
            ""
        );
        filterSearchEditStr.setAllowEmpty(true);

        this.markup.find("select.view").change(function(admin) {
            return function() {
                admin.setView($(this).val());
                admin.render();
            };
        }(this));

        new EditableString(this.markup.find("span.timeNormalisationPercentage"), function(admin) {
            return function(oldValue, newValue) {
                try {
                    const intValue = parseInt(newValue);
                    if (intValue < 0 || intValue > 500) {
                        return false;
                    }
                    if ("" + intValue !== newValue) {
                        return false;
                    }
                    admin.timeTracker.setTimeNormalisationPercentage(intValue / 100.0);
                    admin.timeTracker.save();
                    admin.dirty = true;
                    admin.render();
                } catch(err) {
                    return false;
                }
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

        this.markup.find("button.backup").click(function(admin) {
            return function() {
                admin.backup();
            };
        }(this));

        this.markup.find("button.restore").click(function(admin) {
            return function() {
                admin.restore();
            };
        }(this));

        this.markup.find("button.exportCSV").click(function(admin) {
            return function() {
                admin.exportCSV();
            };
        }(this));

        this.setLogDateFilter("week-0");

        const body = $("body");
        body.prepend(this.markup);
        body.prepend(this.overlayMarkup);

        this.adminTimeRibbon = new TimeRibbon(this.markup.find(".time-ribbon"), this.timeTracker);
        this.adminTimeRibbon.setDrawTable(true);
        this.projectEditorEl = this.markup.find(".project-editor");
    }

    renderProjectFilter() {
        const projectFilterEl = this.markup.find("div.project-filter");
        projectFilterEl.empty();

        const projects = this.timeTracker.getProjects();
        if (projects) {
            $.each(projects, function(admin) {
                return function(projectIndex, project) {
                    const projectCheckboxDiv = $(`<div style="background-color: ${project.getBackgroundColour()}"></div>`);
                    const projectCheckbox = $(`
                        <input type="checkbox" ${project.isSelected() ? "checked=\"checked\"" : ""} id="${project.getKey()}" name="projectFilter" value="${project.getKey()}">
                        <label for="${project.getKey()}">${project.getName()}</label>
                    `);

                    projectCheckbox.change(function(admin, project) {
                        return function() {
                            const checkbox = $(this);
                            project.setSelected(checkbox.is(":checked"));
                            project.save();
                            admin.render();
                            admin.dirty = true;
                        };
                    }(admin, project));

                    projectCheckboxDiv.append(projectCheckbox);
                    projectFilterEl.append(projectCheckboxDiv);
                };
            }(this));
        }
    }

    setLogDateFilter(filterStr) {
        const oneDay = 24 * 60 * 60;
        let fromDate = null;
        let toDate = null;
        let filterType = null;

        if (filterStr) {
            const filterStrParts = filterStr.split("-");
             // filterType = day, week, month, year, finyear
            filterType = filterStrParts[0];
            const filterNumberStr = filterStrParts[1];

            let filterNumber = 0;
            try {
                filterNumber = parseInt(filterNumberStr);
            } catch(err) {
                console.error("Unsupported filter number: " + filterNumberStr);
                return;
            }

            switch(filterType) {
                case "day":
                    const dayStart = new Date();
                    dayStart.setMilliseconds(0);
                    dayStart.setSeconds(0);
                    dayStart.setMinutes(0);
                    dayStart.setHours(0);

                    const day = dayStart.getDate() - filterNumber;
                    dayStart.setDate(day);
                    fromDate = Math.floor(dayStart.getTime() / 1000);

                    dayStart.setDate(day+1);
                    toDate = Math.floor(dayStart.getTime() / 1000);
                    break;

                case "week":
                    const oneWeek = 7 * oneDay;
                    fromDate = Utils.getCurrentWeekStart() - (filterNumber * oneWeek);
                    toDate = fromDate + oneWeek;
                    break;

                case "month":
                    const monthStart = new Date();
                    monthStart.setMilliseconds(0);
                    monthStart.setSeconds(0);
                    monthStart.setMinutes(0);
                    monthStart.setHours(0);
                    monthStart.setDate(1);

                    const month = monthStart.getMonth() - filterNumber;
                    monthStart.setMonth(month);
                    fromDate = Math.floor(monthStart.getTime() / 1000);

                    monthStart.setMonth(month+1);
                    toDate = Math.floor(monthStart.getTime() / 1000);
                    break;

                case "year":
                    const yearStart = new Date();
                    yearStart.setMilliseconds(0);
                    yearStart.setSeconds(0);
                    yearStart.setMinutes(0);
                    yearStart.setHours(0);
                    yearStart.setDate(1);
                    yearStart.setMonth(0);

                    const year = yearStart.getFullYear() - filterNumber;
                    yearStart.setFullYear(year);
                    fromDate = Math.floor(yearStart.getTime() / 1000);

                    yearStart.setFullYear(year+1);
                    toDate = Math.floor(yearStart.getTime() / 1000);
                    break;

                case "finyear":
                    // 1 July to 30 June
                    const finYearStart = new Date();
                    // Determine if we have started the new financial year
                    // NOTE: Month is 0-indexed
                    const newFinYear = finYearStart.getMonth() >= 6;

                    finYearStart.setMilliseconds(0);
                    finYearStart.setSeconds(0);
                    finYearStart.setMinutes(0);
                    finYearStart.setHours(0);
                    finYearStart.setDate(1);
                    finYearStart.setMonth(6); // July, 0-indexed

                    let finYear = finYearStart.getFullYear() - filterNumber;
                    if (!newFinYear) {
                        finYear--;
                    }
                    finYearStart.setFullYear(finYear);
                    fromDate = Math.floor(finYearStart.getTime() / 1000);

                    finYearStart.setFullYear(finYear+1);
                    toDate = Math.floor(finYearStart.getTime() / 1000);
                    break;

                case "custom":
                    // Nothing to do
                    break;

                default:
                    console.error("Unsupported filter type: " + filterType);
                    break;
            }
        }

        if (filterType !== "custom") {
            if (toDate !== null) {
                // Remove one day because humans struggle to understand non inclusive dates
                toDate -= oneDay;
            }

            this.filterDateFromEl.text(Utils.formatDate(fromDate));
            this.filterDateToEl.text(Utils.formatDate(toDate))
        }

        this.updateFilterDates();
    }

    updateFilterDates() {
        const oneDay = 24 * 60 * 60;
        const fromDate = Utils.parseDate(this.filterDateFromEl.text());
        let toDate = Utils.parseDate(this.filterDateToEl.text());

        // Add the one day because the date is actually at time 00:00:00
        // It's basically equivalent to a non inclusive filter: [fromDate, toDate[
        if (toDate !== null) {
            toDate += oneDay;
        }

        this.dateFilter = new LogDateFilter(fromDate, toDate);
    }

    updateFilterSearch(searchStr) {
        this.searchFilter = new LogSearchFilter(searchStr);
        console.log("UPDATE SEARCH: " + searchStr);
        this.render();
    }

    setView(view) {
        this.view = view;
    }

    renderProjectEditor() {
        this.destroyProjectEditor();

        if (this.view === "project") {
            this.renderProjectEditorByProjects();
        } else if (this.view === "dateChrono") {
            this.renderProjectEditorByDatesChronological();
        } else {
            this.renderProjectEditorByDates();
        }
    }

    renderProjectEditorByProjects() {
        const projects = this.timeTracker.getSelectedProjects();
        if (!projects || projects.length <= 0) {
            return;
        }

        let projectTable = $(`<table class="projects-table">
            <tr class="header">
                <th class="key">Key</th>
                <th>Name</th>
                <th>Colour</th>
                <th class="delete-column">X</th>
            </tr>
        </table>`);
        $.each(projects, function(admin) {
            return function(projectIndex, project) {
                let projectTableRow = $(`<tr style="background-color: ${project.getBackgroundColour()}">
                    <td class="key">${project.getKey()}</td>
                    <td class="name">${Utils.escapeHTML(project.getName())}</td>
                </tr>`);

                let projectColourCellEl = $(`<td></td>`);
                let projectColourSelect = $(`<select class="projectColour"></select>`);
                $.each(Project.getProjectColours(), function(index, colour) {
                    const selected = index === project.getColourIndex();
                    projectColourSelect.append($(`<option value="${index}" style="background-color: ${colour.backgroundColour}" ${selected ? "selected=\"selected\"" : ""}>${colour.label}</option>`));
                });
                projectColourCellEl.append(projectColourSelect);

                projectColourSelect.change(function(admin, project) {
                    return function() {
                        project.setColourIndex($(this).val());
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
                projectLogsCell.append(admin.renderProjectLogsEditorByProjects(project));

                projectLogsRow.append(projectLogsCell);
                projectTable.append(projectLogsRow);
            }
        }(this));

        this.projectEditorEl.append(projectTable);
    }

    renderProjectEditorByDates() {
        const projects = this.timeTracker.getSelectedProjects();
        if (!projects || projects.length <= 0) {
            return;
        }

        let datesTable = $(`<table class="dates-table">
            <tr class="header">
                <th class="weekday">Weekday</th>
                <th>Date</th>
            </tr>
        </table>`);

        const dates = {};
        $.each(projects, function(admin) {
            return function(projectIndex, project) {
                let logs = project.getLogs([admin.dateFilter, admin.searchFilter]);
                if (logs !== null && logs.length > 0) {
                    $.each(logs, function(logIndex, log) {
                        const logDate = Utils.formatDate(log.getStartDate());
                        if (!dates[logDate]) {
                            dates[logDate] = {};
                        }
                        if (!dates[logDate][project.getKey()]) {
                            dates[logDate][project.getKey()] = [];
                        }
                        dates[logDate][project.getKey()].push(log);
                    });
                }
            };
        }(this));

        const sortedDates = Object.keys(dates);
        sortedDates.sort();
        $.each(sortedDates, function(admin) {
            return function(dateIndex, dateStr) {
                const date = Utils.parseDatetime(dateStr);

                const dateRow = $(`<tr></tr>`);

                let weekdayCellEl = $(`<td></td>`);
                let weekdayCellDataEl = $(`<span>${Utils.getWeekday(date)}</span>`);
                weekdayCellEl.append(weekdayCellDataEl);

                let dateCellEl = $(`<td></td>`);
                let dateCellDataEl = $(`<span>${dateStr}</span>`);
                dateCellEl.append(dateCellDataEl);

                dateRow.append(weekdayCellEl);
                dateRow.append(dateCellEl);

                datesTable.append(dateRow);

                const logRow = $(`<tr></tr>`);
                let logCellEl = $(`<td colspan="2"></td>`);
                let logCellDataEl = admin.renderProjectLogsEditorByDates(dates[dateStr], projects);
                logCellEl.append(logCellDataEl);
                logRow.append(logCellEl);

                datesTable.append(logRow);
            };
        }(this));

        this.projectEditorEl.append(datesTable);
    }

    renderProjectEditorByDatesChronological() {
        const projects = this.timeTracker.getSelectedProjects();
        if (!projects || projects.length <= 0) {
            return;
        }

        let datesTable = $(`<table class="dates-table">
            <tr class="header">
                <th class="weekday">Weekday</th>
                <th>Date</th>
            </tr>
        </table>`);

        const dates = {};
        $.each(projects, function(admin) {
            return function(projectIndex, project) {
                let logs = project.getLogs([admin.dateFilter, admin.searchFilter]);
                if (logs !== null && logs.length > 0) {
                    $.each(logs, function(logIndex, log) {
                        const logDate = Utils.formatDate(log.getStartDate());
                        if (!dates[logDate]) {
                            dates[logDate] = [];
                        }
                        dates[logDate].push(log);
                    });
                }
            };
        }(this));

        const sortedDates = Object.keys(dates);
        sortedDates.sort();
        $.each(sortedDates, function(admin) {
            return function(dateIndex, dateStr) {
                const date = Utils.parseDatetime(dateStr);

                const dateRow = $(`<tr></tr>`);

                let weekdayCellEl = $(`<td></td>`);
                let weekdayCellDataEl = $(`<span>${Utils.getWeekday(date)}</span>`);
                weekdayCellEl.append(weekdayCellDataEl);

                let dateCellEl = $(`<td></td>`);
                let dateCellDataEl = $(`<span>${dateStr}</span>`);
                dateCellEl.append(dateCellDataEl);

                dateRow.append(weekdayCellEl);
                dateRow.append(dateCellEl);

                datesTable.append(dateRow);

                const logRow = $(`<tr></tr>`);
                let logCellEl = $(`<td colspan="2"></td>`);
                let logCellDataEl = admin.renderProjectLogsEditorByDatesChronological(dates[dateStr], projects);
                logCellEl.append(logCellDataEl);
                logRow.append(logCellEl);

                datesTable.append(logRow);
            };
        }(this));

        this.projectEditorEl.append(datesTable);
    }



    renderProjectLogsEditorByProjects(project) {
        const timeNormalisation = this.timeTracker.getTimeNormalisationPercentage();

        let logs = project.getLogs([this.dateFilter, this.searchFilter]);
        if (logs !== null && logs.length > 0) {
            let logsTable = $(`<table class="logs-table">
                <tr class="header">
                    <th class="key">Key</th>
                    <th>Weekday</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th>Time</th>
                    <th>Normalised time</th>
                    <th>Message</th>
                    <th class="delete-column">X</th>
                </tr>
            </table>`);

            let lastWeekNumber = null, currentWeekNumber = null;
            let lastTotalWeekNumber = null;
            let grandTotalTime = 0;
            let totalTime = 0;
            let totalRowCount = 0; // Number of "total" row shown
            $.each(logs, function(admin) {
                return function(logIndex, log) {
                    if (lastWeekNumber === null) {
                        lastWeekNumber = Utils.getWeekNumber(log.getStartDate());
                    }
                    currentWeekNumber = Utils.getWeekNumber(log.getStartDate());

                    if (lastWeekNumber !== currentWeekNumber) {
                        logsTable.append(admin._getTotalRow(totalTime));
                        totalRowCount++;
                        totalTime = 0;
                        lastTotalWeekNumber = lastWeekNumber;
                    }

                    let elapseTime = log.getElapseTime();
                    grandTotalTime += elapseTime;
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

                    let elapseTimeNormalisedCellEl = $(`<td></td>`);
                    let elapseTimeNormalisedCellDataEl = $(`<span>${Utils.formatTime(elapseTime * timeNormalisation)}</span>`);
                    elapseTimeNormalisedCellEl.append(elapseTimeNormalisedCellDataEl);

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
                    logRow.append(elapseTimeNormalisedCellEl);
                    logRow.append(messageCellEl);
                    logRow.append(deleteCellEl);

                    new EditableString(startDateCellDataEl, function(admin, log) {
                        return function(oldValue, newValue) {
                            const newDate = Utils.parseDatetime(newValue);
                            if (newDate) {
                                log.setStartDate(newDate);
                                log.save();
                                admin.render();
                                admin.dirty = true;
                            } else {
                                return false;
                            }
                        }
                    }(admin, log));

                    new EditableString(endDateCellDataEl, function(admin, log) {
                        return function(oldValue, newValue) {
                            const newDate = Utils.parseDatetime(newValue);
                            if (newDate) {
                                log.setEndDate(newDate);
                                log.save();
                                admin.render();
                                admin.dirty = true;
                            } else {
                                return false;
                            }
                        }
                    }(admin, log));

                    new EditableString(messageCellDataEl, function(admin, log) {
                        return function(oldValue, newValue) {
                            log.setMessage(newValue);
                            log.save();
                            admin.render();
                            admin.dirty = true;
                        }
                    }(admin, log));

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
                totalRowCount++;
            }

            if (totalRowCount > 1) {
                const spacerRow = $(`<tr class="spacer">
                    <td class="key"></td>
                    <th colspan="7"></th>
                </tr>`);
                logsTable.append(spacerRow);

                logsTable.append(this._getTotalRow(grandTotalTime, "GRAND TOTAL"));
            }

            return logsTable;
        }

        return null;
    }

    _getTotalRow(total, label) {
        label = label ? label : "TOTAL";

        const timeNormalisation = this.timeTracker.getTimeNormalisationPercentage();

        let totalRow = $(`<tr class="total">
            <td class="key"></td>
            <th colspan="3">${label}</th>
        </tr>`);

        let totalCellEl = $(`<td></td>`);
        let totalCellDataEl = $(`<span>${Utils.formatTime(total)}</span>`);
        totalCellEl.append(totalCellDataEl);

        let totalNormalisedCellEl = $(`<td></td>`);
        let totalNormalisedCellDataEl = $(`<span>${Utils.formatTime(total * timeNormalisation)}</span>`);
        totalNormalisedCellEl.append(totalNormalisedCellDataEl);

        totalRow.append(totalCellEl);
        totalRow.append(totalNormalisedCellEl);

        // Filler
        totalRow.append(`<td colspan="2"></td>`);

        return totalRow;
    }

    // Key: projectKey
    // Value: array of Log
    renderProjectLogsEditorByDates(logMap, projects) {
        if (!logMap) {
            return "";
        }

        const projectKeys = Object.keys(logMap);
        if (projectKeys.length <= 0) {
            return "";
        }

        const timeNormalisation = this.timeTracker.getTimeNormalisationPercentage();

        const logsTable = $(`<table class="logs-table">
            <tr class="header">
                <th class="key">Key</th>
                <th>Project</th>
                <th>Start date</th>
                <th>End date</th>
                <th>Time</th>
                <th>Normalised time</th>
                <th>Message</th>
                <th class="delete-column">X</th>
            </tr>
        </table>`);

        let dayTotal = 0;
        $.each(projects, function(admin) {
            return function(projectIndex, project) {
                const logList = logMap[project.getKey()];
                const projectColor = project.getBackgroundColour();
                if (logList) {

                    const spacerRow = $(`<tr class="spacer">
                        <td class="key"></td>
                        <th colspan="7"></th>
                    </tr>`);
                    logsTable.append(spacerRow);

                    let total = 0;
                    $.each(logList, function(logIndex, log) {
                        const elapseTime = log.getElapseTime();
                        total += elapseTime;
                        const logRow = $(`<tr>
                            <td class="key">${Utils.escapeHTML(log.getKey())}</td>
                            <td style="background-color: ${projectColor}">${Utils.escapeHTML(project.getName())}</td>
                        </tr>`);

                        let startDateCellEl = $(`<td></td>`);
                        let startDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getStartDate())}</span>`);
                        startDateCellEl.append(startDateCellDataEl);

                        let endDateCellEl = $(`<td></td>`);
                        let endDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getEndDate())}</span>`);
                        endDateCellEl.append(endDateCellDataEl);

                        let elapseTimeCellEl = $(`<td></td>`);
                        let elapseTimeCellDataEl = $(`<span>${Utils.formatTime(elapseTime)}</span>`);
                        elapseTimeCellEl.append(elapseTimeCellDataEl);

                        let elapseTimeNormalisedCellEl = $(`<td></td>`);
                        let elapseTimeNormalisedCellDataEl = $(`<span>${Utils.formatTime(elapseTime * timeNormalisation)}</span>`);
                        elapseTimeNormalisedCellEl.append(elapseTimeNormalisedCellDataEl);

                        let messageCellEl = $(`<td></td>`);
                        let messageCellDataEl = $(`<span>${Utils.escapeHTML(log.getMessage())}</span>`);
                        messageCellEl.append(messageCellDataEl);

                        let deleteCellEl = $(`<td class="delete-column"></td>`);
                        let deleteCellButtonEl = $(`<button class="delete">X</button>`);
                        deleteCellEl.append(deleteCellButtonEl);

                        logRow.append(startDateCellEl);
                        logRow.append(endDateCellEl);
                        logRow.append(elapseTimeCellEl);
                        logRow.append(elapseTimeNormalisedCellEl);
                        logRow.append(messageCellEl);
                        logRow.append(deleteCellEl);

                        new EditableString(startDateCellDataEl, function(admin, log) {
                            return function(oldValue, newValue) {
                                const newDate = Utils.parseDatetime(newValue);
                                if (newDate) {
                                    log.setStartDate(newDate);
                                    log.save();
                                    admin.render();
                                    admin.dirty = true;
                                } else {
                                    return false;
                                }
                            }
                        }(admin, log));

                        new EditableString(endDateCellDataEl, function(admin, log) {
                            return function(oldValue, newValue) {
                                const newDate = Utils.parseDatetime(newValue);
                                if (newDate) {
                                    log.setEndDate(newDate);
                                    log.save();
                                    admin.render();
                                    admin.dirty = true;
                                } else {
                                    return false;
                                }
                            }
                        }(admin, log));

                        new EditableString(messageCellDataEl, function(admin, log) {
                            return function(oldValue, newValue) {
                                log.setMessage(newValue);
                                log.save();
                                admin.render();
                                admin.dirty = true;
                            }
                        }(admin, log));

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
                    });

                    const totalRow = $(`<tr class="total">
                        <td class="key"></td>
                        <th style="background-color: ${projectColor}">TOTAL</th>
                        <th colspan="2"></th>
                        <td>${Utils.formatTime(total)}</td>
                        <td>${Utils.formatTime(total * timeNormalisation)}</td>
                        <td colspan="2"></td>
                    </tr>`);

                    dayTotal += total;
                    logsTable.append(totalRow);
                }
            };
        }(this));

        const spacerRow = $(`<tr class="spacer">
            <td class="key"></td>
            <th colspan="7"></th>
        </tr>`);
        logsTable.append(spacerRow);

        const dayTotalRow = $(`<tr class="total">
            <td class="key"></td>
            <th>GRAND TOTAL</th>
            <th colspan="2"></th>
            <td>${Utils.formatTime(dayTotal)}</td>
            <td>${Utils.formatTime(dayTotal * timeNormalisation)}</td>
            <td colspan="2"></td>
        </tr>`);
        logsTable.append(dayTotalRow);

        return logsTable;
    }

    renderProjectLogsEditorByDatesChronological(logArray, projects) {
        if (!logArray || logArray.length <= 0) {
            return "";
        }

        logArray.sort(function (logA, logB) {
            return logA.getStartDate() - logB.getStartDate();
        });

        const timeNormalisation = this.timeTracker.getTimeNormalisationPercentage();

        const logsTable = $(`<table class="logs-table">
            <tr class="header">
                <th class="key">Key</th>
                <th>Project</th>
                <th>Start date</th>
                <th>End date</th>
                <th>Time</th>
                <th>Normalised time</th>
                <th>Message</th>
                <th class="delete-column">X</th>
            </tr>
        </table>`);

        let dayTotal = 0;
        $.each(logArray, function(admin) {
            return function(logIndex, log) {
                const project = log.getProject();
                const projectColor = project.getBackgroundColour();
                const elapseTime = log.getElapseTime();
                dayTotal += elapseTime;
                const logRow = $(`<tr>
                    <td class="key">${Utils.escapeHTML(log.getKey())}</td>
                    <td style="background-color: ${projectColor}">${Utils.escapeHTML(project.getName())}</td>
                </tr>`);

                let startDateCellEl = $(`<td></td>`);
                let startDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getStartDate())}</span>`);
                startDateCellEl.append(startDateCellDataEl);

                let endDateCellEl = $(`<td></td>`);
                let endDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getEndDate())}</span>`);
                endDateCellEl.append(endDateCellDataEl);

                let elapseTimeCellEl = $(`<td></td>`);
                let elapseTimeCellDataEl = $(`<span>${Utils.formatTime(elapseTime)}</span>`);
                elapseTimeCellEl.append(elapseTimeCellDataEl);

                let elapseTimeNormalisedCellEl = $(`<td></td>`);
                let elapseTimeNormalisedCellDataEl = $(`<span>${Utils.formatTime(elapseTime * timeNormalisation)}</span>`);
                elapseTimeNormalisedCellEl.append(elapseTimeNormalisedCellDataEl);

                let messageCellEl = $(`<td></td>`);
                let messageCellDataEl = $(`<span>${Utils.escapeHTML(log.getMessage())}</span>`);
                messageCellEl.append(messageCellDataEl);

                let deleteCellEl = $(`<td class="delete-column"></td>`);
                let deleteCellButtonEl = $(`<button class="delete">X</button>`);
                deleteCellEl.append(deleteCellButtonEl);

                logRow.append(startDateCellEl);
                logRow.append(endDateCellEl);
                logRow.append(elapseTimeCellEl);
                logRow.append(elapseTimeNormalisedCellEl);
                logRow.append(messageCellEl);
                logRow.append(deleteCellEl);

                new EditableString(startDateCellDataEl, function(admin, log) {
                    return function(oldValue, newValue) {
                        const newDate = Utils.parseDatetime(newValue);
                        if (newDate) {
                            log.setStartDate(newDate);
                            log.save();
                            admin.render();
                            admin.dirty = true;
                        } else {
                            return false;
                        }
                    }
                }(admin, log));

                new EditableString(endDateCellDataEl, function(admin, log) {
                    return function(oldValue, newValue) {
                        const newDate = Utils.parseDatetime(newValue);
                        if (newDate) {
                            log.setEndDate(newDate);
                            log.save();
                            admin.render();
                            admin.dirty = true;
                        } else {
                            return false;
                        }
                    }
                }(admin, log));

                new EditableString(messageCellDataEl, function(admin, log) {
                    return function(oldValue, newValue) {
                        log.setMessage(newValue);
                        log.save();
                        admin.render();
                        admin.dirty = true;
                    }
                }(admin, log));

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
            };
        }(this));

        const dayTotalRow = $(`<tr class="total">
            <td class="key"></td>
            <th>TOTAL</th>
            <th colspan="2"></th>
            <td>${Utils.formatTime(dayTotal)}</td>
            <td>${Utils.formatTime(dayTotal * timeNormalisation)}</td>
            <td colspan="2"></td>
        </tr>`);
        logsTable.append(dayTotalRow);

        return logsTable;
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
        PersistentObject.reset();
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
        this.adminTimeRibbon.render([this.dateFilter, this.searchFilter]);
        this.renderProjectFilter();
        this.renderProjectEditor();
    }

    backup() {
        const jsonDB = PersistentObject.getDBBackup();
        const dateStr = Utils.formatDatetimeForFilename(Utils.getCurrentTimestamp());
        Utils.download(JSON.stringify(jsonDB, null, 4), "time-tracker_backup_" + dateStr + ".json", 'application/json');
    }

    restore() {
        const jsonStr = Utils.upload('application/json', function(jsonStr) {
            try {
                const jsonDB = JSON.parse(jsonStr);
                const nbElements = Object.keys(jsonDB).length;
                if (confirm("Are you sure you want to replace the entire content of this Time Tracker with those " + nbElements + " entries?")) {
                    PersistentObject.restoreDBBackup(jsonDB);
                    alert("Backup successfully restored");
                    location.reload();
                } else {
                    alert("Backup restore aborted");
                }
            } catch(err) {
                alert("Invalid JSON:\n" + err);
            }
        });
    }

    exportCSV() {
        let csvContent = "";

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

        const dateStr = Utils.formatDatetimeForFilename(Utils.getCurrentTimestamp());
        Utils.download(csvContent, "time-tracker_export_" + dateStr + ".csv", 'text/csv');
    }

    // Generate an array of data used to generate a CSV file
    generateDataArray() {
        const dataArray = [];
        dataArray.push(
            ["project_key", "project_name", "log_key", "log_startdate", "log_enddate", "log_message"]
        );

        $.each(this.timeTracker.getSelectedProjects(), function(projectIndex, project) {
            $.each(project.logs, function(logIndex, log) {
                dataArray.push(
                    [project.getKey(), project.getName(), log.getKey(), Utils.formatDateForCSV(log.getStartDate()), Utils.formatDateForCSV(log.getEndDate()), log.getMessage()]
                );
            });
        });

        return dataArray;
    }
}