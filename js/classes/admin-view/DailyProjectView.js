class DailyProjectView extends AbstractView {

    constructor(admin) {
        super(admin);
    }

    render() {
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
        $.each(projects, function(dailyProjectView) {
            return function(projectIndex, project) {
                let logs = project.getLogs([dailyProjectView.admin.getDateFilter(), dailyProjectView.admin.getSearchFilter()]);
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
        $.each(sortedDates, function(dailyProjectView) {
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
                let logCellDataEl = dailyProjectView._renderLogTable(dates[dateStr], projects);
                logCellEl.append(logCellDataEl);
                logRow.append(logCellEl);

                datesTable.append(logRow);
            };
        }(this));

        return datesTable;
    }

    // Key: projectKey
    // Value: array of Log
    _renderLogTable(logMap, projects) {
        if (!logMap) {
            return "";
        }

        const projectKeys = Object.keys(logMap);
        if (projectKeys.length <= 0) {
            return "";
        }

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
        $.each(projects, function(dailyProjectView) {
            return function(projectIndex, project) {
                const selected = project.isSelected();
                const rowClass = selected ? "selected" : "not-selected";

                const logList = logMap[project.getKey()];
                const projectColor = project.getBackgroundColour();
                if (logList) {

                    const spacerRow = $(`<tr class="spacer">
                        <td class="key"></td>
                        <td colspan="7"></td>
                    </tr>`);
                    logsTable.append(spacerRow);

                    let total = 0;
                    $.each(logList, function(logIndex, log) {
                        const elapseTime = log.getElapseTime();
                        total += elapseTime;
                        const logRow = $(`<tr class="${rowClass}">
                            <td class="key">${Utils.escapeHTML(log.getKey())}</td>
                        </tr>`);

                        let projectCellEl = $(`<td style="background-color: ${projectColor}"></td>`);
                        let projectCellDataEl = $(`<span>${Utils.escapeHTML(project.getName())}</span>`);
                        projectCellEl.append(projectCellDataEl);

                        const startDateClass = log.isStartDateOverlaps() ? "overlaps" : "";
                        let startDateCellEl = $(`<td class="${startDateClass}"></td>`);
                        let startDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getStartDate())}</span>`);
                        startDateCellEl.append(startDateCellDataEl);

                        const endDateClass = log.isEndDateOverlaps() ? "overlaps" : "";
                        let endDateCellEl = $(`<td class="${endDateClass}"></td>`);
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

                        new EditableProject(projectCellEl, dailyProjectView.admin.timeTracker, project, dailyProjectView.getEditLogProjectFunction(log));
                        new EditableString(startDateCellDataEl, dailyProjectView.getEditLogStartDateFunction(log));
                        new EditableString(endDateCellDataEl, dailyProjectView.getEditLogEndDateFunction(log));
                        new EditableString(messageCellDataEl, dailyProjectView.getEditLogMessageFunction(log));
                        deleteCellButtonEl.click(dailyProjectView.getDeleteLogFunction(log));

                        logsTable.append(logRow);
                    });

                    const totalRow = $(`<tr class="total ${rowClass}">
                        <td class="key"></td>
                        <th style="background-color: ${projectColor}">TOTAL</th>
                        <th colspan="2"></th>
                        <td>${Utils.formatTotalTime(total)}</td>
                        <td>${Utils.formatTotalTime(total * timeNormalisation)}</td>
                        <td colspan="2"></td>
                    </tr>`);

                    if (selected) {
                        dayTotal += total;
                    }
                    logsTable.append(totalRow);
                }
            };
        }(this));

        const spacerRow = $(`<tr class="spacer">
            <td class="key"></td>
            <td colspan="7"></td>
        </tr>`);
        logsTable.append(spacerRow);

        const dayTotalRow = $(`<tr class="total">
            <td class="key"></td>
            <th>GRAND TOTAL</th>
            <th colspan="2"></th>
            <td>${Utils.formatTotalTime(dayTotal)}</td>
            <td>${Utils.formatTotalTime(dayTotal * timeNormalisation)}</td>
            <td colspan="2"></td>
        </tr>`);
        logsTable.append(dayTotalRow);

        return logsTable;
    }

}
