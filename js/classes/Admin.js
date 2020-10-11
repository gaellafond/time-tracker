class Admin {

    constructor(timeTracker) {
        this.dirty = false;

        this.timeTracker = timeTracker;
        this.overlayMarkup = $(`<div class="overlay"></div>`);
        this.dateFilter = null;
        this.searchFilter = null;

        this.viewMap = {
            "chronoView": new ChronoView(this),
            "dailyProjectView": new DailyProjectView(this),
            "projectView": new ProjectView(this)
        };
        this.setView("chronoView");

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
                            <option value="chronoView" selected="selected">By dates</option>
                            <option value="dailyProjectView">By dates, grouped by projects</option>
                            <option value="projectView">By projects</option>
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
        this.render();
    }

    setView(viewId) {
        if (this.viewMap.hasOwnProperty(viewId)) {
            this.view = this.viewMap[viewId];
        } else {
            alert("ERROR: Invalid view ID " + viewId);
        }
    }

    renderProjectEditor() {
        this.destroyProjectEditor();

        if (this.view) {
            this.projectEditorEl.append(this.view.render());
        } else {
            console.error("Invalid view object");
        }
    }

    getDateFilter() {
        return this.dateFilter;
    }

    getSearchFilter() {
        return this.searchFilter;
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
