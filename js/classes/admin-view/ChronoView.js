class ChronoView extends AbstractView {

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
                let logCellDataEl = chronoView._renderLogTable(dates[dateStr], projects);
                logCellEl.append(logCellDataEl);
                logRow.append(logCellEl);

                datesTable.append(logRow);
            };
        }(this));

        return datesTable;
    }

    _renderLogTable(logArray, projects) {
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

                new EditableProject(projectCellEl, chronoView.admin.timeTracker, project, chronoView.getEditLogProjectFunction(log));
                new EditableString(startDateCellDataEl, chronoView.getEditLogStartDateFunction(log));
                new EditableString(endDateCellDataEl, chronoView.getEditLogEndDateFunction(log));
                new EditableString(messageCellDataEl, chronoView.getEditLogMessageFunction(log));
                deleteCellButtonEl.click(chronoView.getDeleteLogFunction(log));

                logsTable.append(logRow);
            };
        }(this));

        const dayTotalRow = $(`<tr class="total">
            <td class="key"></td>
            <th>TOTAL</th>
            <th colspan="2"></th>
            <td>${Utils.formatTotalTime(dayTotal)}</td>
            <td>${Utils.formatTotalTime(dayTotal * timeNormalisation)}</td>
            <td colspan="2"></td>
        </tr>`);
        logsTable.append(dayTotalRow);

        return logsTable;
    }

}
