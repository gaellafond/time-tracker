class ChronoView extends AbstractView {

    constructor(admin) {
        super();
        this.admin = admin;
    }

    render(containerEl) {
        const projects = this.admin.timeTracker.getProjects();
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
        $.each(projects, function(chronoView) {
            return function(projectIndex, project) {
                let logs = project.getLogs([chronoView.admin.getDateFilter(), chronoView.admin.getSearchFilter()]);
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
        $.each(sortedDates, function(chronoView) {
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
                let logCellDataEl = chronoView.renderProjectLogsEditorByDatesChronological(dates[dateStr], projects);
                logCellEl.append(logCellDataEl);
                logRow.append(logCellEl);

                datesTable.append(logRow);
            };
        }(this));

        containerEl.append(datesTable);
    }

    renderProjectLogsEditorByDatesChronological(logArray, projects) {
        if (!logArray || logArray.length <= 0) {
            return "";
        }

        logArray.sort(function (logA, logB) {
            return logA.getStartDate() - logB.getStartDate();
        });

        const timeNormalisation = this.admin.timeTracker.getTimeNormalisationPercentage();

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
        $.each(logArray, function(chronoView) {
            return function(logIndex, log) {
                const project = log.getProject();
                const selected = project.isSelected();
                const rowClass = selected ? "selected" : "not-selected";
                const projectColor = project.getBackgroundColour();
                const elapseTime = log.getElapseTime();

                if (selected) {
                    dayTotal += elapseTime;
                }
                const logRow = $(`<tr class="${rowClass}">
                    <td class="key">${Utils.escapeHTML(log.getKey())}</td>
                </tr>`);

                let projectCellEl = $(`<td style="background-color: ${projectColor}"></td>`);
                let projectCellDataEl = $(`<span>${Utils.escapeHTML(project.getName())}</span>`);
                projectCellEl.append(projectCellDataEl);

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

                logRow.append(projectCellEl);
                logRow.append(startDateCellEl);
                logRow.append(endDateCellEl);
                logRow.append(elapseTimeCellEl);
                logRow.append(elapseTimeNormalisedCellEl);
                logRow.append(messageCellEl);
                logRow.append(deleteCellEl);

                new EditableProject(projectCellEl, chronoView.admin.timeTracker, project, function(chronoView, log) {
                    return function(oldProject, newProject) {
                        log.setProject(newProject);
                        chronoView.admin.render();
                        chronoView.admin.dirty = true;
                    }
                }(chronoView, log));

                new EditableString(startDateCellDataEl, function(chronoView, log) {
                    return function(oldValue, newValue) {
                        const newDate = Utils.parseDatetime(newValue);
                        if (newDate) {
                            log.setStartDate(newDate);
                            log.save();
                            chronoView.admin.render();
                            chronoView.admin.dirty = true;
                        } else {
                            return false;
                        }
                    }
                }(chronoView, log));

                new EditableString(endDateCellDataEl, function(chronoView, log) {
                    return function(oldValue, newValue) {
                        const newDate = Utils.parseDatetime(newValue);
                        if (newDate) {
                            log.setEndDate(newDate);
                            log.save();
                            chronoView.admin.render();
                            chronoView.admin.dirty = true;
                        } else {
                            return false;
                        }
                    }
                }(chronoView, log));

                new EditableString(messageCellDataEl, function(chronoView, log) {
                    return function(oldValue, newValue) {
                        log.setMessage(newValue);
                        log.save();
                        chronoView.admin.render();
                        chronoView.admin.dirty = true;
                    }
                }(chronoView, log));

                deleteCellButtonEl.click(function(chronoView, log) {
                    return function() {
                        // NOTE: No character need escaping in a "confirm" window
                        const warningMessage =
                            "Are you sure you want to delete this log?\n" +
                            "    Log: " + log.getMessage() + "\n" +
                            "    Project: " + log.getProject().getName()
                        if (window.confirm(warningMessage)) {
                            log.delete();
                            chronoView.admin.timeTracker.reload();
                            chronoView.admin.render();
                            chronoView.admin.dirty = true;
                        }
                    };
                }(chronoView, log));

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

}
