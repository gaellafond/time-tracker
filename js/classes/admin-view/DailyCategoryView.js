class DailyCategoryView extends AbstractView {

    constructor(admin) {
        super(admin);
    }

    render() {
        const categories = this.admin.timeTracker.getCategories();
        const projects = this.admin.timeTracker.getProjects();
        if (!projects || projects.length <= 0) {
            return;
        }

        let datesTable = $(`<table class="dates-table">
            <tr class="header">
                <th class="weekday">Weekday</th>
                <th>Date TEST</th>
            </tr>
        </table>`);

        const dates = {};
        $.each(categories, function(dailyCategoryView) {
            return function(categoryIndex, category) {
                const categoryKey = category.getKey();
                $.each(category.getProjects(), function(dailyCategoryView) {
                    return function(projectIndex, project) {
                        const projectKey = project.getKey();
                        let logs = project.getLogs([dailyCategoryView.admin.getDateFilter(), dailyCategoryView.admin.getSearchFilter()]);
                        if (logs !== null && logs.length > 0) {
                            $.each(logs, function(logIndex, log) {
                                const logDate = Utils.formatDate(log.getStartDate());
                                if (!dates[logDate]) {
                                    dates[logDate] = {};
                                }
                                if (!dates[logDate][categoryKey]) {
                                    dates[logDate][categoryKey] = {};
                                }
                                if (!dates[logDate][categoryKey][projectKey]) {
                                    dates[logDate][categoryKey][projectKey] = [];
                                }
                                dates[logDate][categoryKey][projectKey].push(log);
                            });
                        }
                    };
                }(dailyCategoryView));
            };
        }(this));

        const sortedDates = Object.keys(dates);
        sortedDates.sort();
        $.each(sortedDates, function(dailyCategoryView) {
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
                let logCellDataEl = dailyCategoryView._renderCategoryLogTable(dates[dateStr], categories);
                logCellEl.append(logCellDataEl);
                logRow.append(logCellEl);

                datesTable.append(logRow);
            };
        }(this));

        return datesTable;
    }

    // logMap:
    //     Key: categoryKey
    //     Value: Map of Project Key => array of Log
    _renderCategoryLogTable(logMap, categories) {
        if (!logMap) {
            return "";
        }

        const categoryKeys = Object.keys(logMap);
        if (categoryKeys.length <= 0) {
            return "";
        }

        const timeNormalisation = this.admin.timeTracker.getTimeNormalisationPercentage();

        const logsTable = $(`<table class="logs-table category-logs-table">
            <tr class="header">
                <th class="key">Key</th>
                <th>Category</th>
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
        $.each(categories, function(dailyCategoryView) {
            return function(categoryIndex, category) {
                const categoryKey = category.getKey();

                if (!logMap[categoryKey]) {
                    return true; // continue
                }

                const spacerRow = $(`<tr class="spacer">
                    <td class="key"></td>
                    <th colspan="8"></th>
                </tr>`);
                logsTable.append(spacerRow);

                let categoryTotal = 0;
                $.each(category.getProjects(), function(dailyCategoryView) {
                    return function(projectIndex, project) {
                        const projectKey = project.getKey();
                        const selected = project.isSelected();
                        const rowClass = selected ? "selected" : "not-selected";

                        const logList = logMap[categoryKey][projectKey];
                        const projectColor = project.getBackgroundColour();
                        if (logList) {
                            let total = 0;
                            $.each(logList, function(logIndex, log) {
                                const elapseTime = log.getElapseTime();
                                total += elapseTime;
                                const logRow = $(`<tr class="${rowClass}">
                                    <td class="key">${Utils.escapeHTML(log.getKey())}</td>
                                </tr>`);

                                let categoryCellEl = $(`<td></td>`);
                                let categoryCellDataEl = $(`<span>${Utils.escapeHTML(category.getName())}</span>`);
                                categoryCellEl.append(categoryCellDataEl);

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

                                logRow.append(categoryCellEl);
                                logRow.append(projectCellEl);
                                logRow.append(startDateCellEl);
                                logRow.append(endDateCellEl);
                                logRow.append(elapseTimeCellEl);
                                logRow.append(elapseTimeNormalisedCellEl);
                                logRow.append(messageCellEl);
                                logRow.append(deleteCellEl);

                                new EditableProject(projectCellEl, dailyCategoryView.admin.timeTracker, project, dailyCategoryView.getEditLogProjectFunction(log));
                                new EditableString(startDateCellDataEl, dailyCategoryView.getEditLogStartDateFunction(log));
                                new EditableString(endDateCellDataEl, dailyCategoryView.getEditLogEndDateFunction(log));
                                new EditableString(messageCellDataEl, dailyCategoryView.getEditLogMessageFunction(log));
                                deleteCellButtonEl.click(dailyCategoryView.getDeleteLogFunction(log));

                                logsTable.append(logRow);
                            });

                            const projectTotalRow = $(`<tr class="${rowClass}">
                                <td class="key"></td>
                                <td></td> <!-- Category -->
                                <th style="background-color: ${projectColor}; text-align:left;">TOTAL</th>
                                <th colspan="2"></th>
                                <td>${Utils.formatTotalTime(total)}</td>
                                <td>${Utils.formatTotalTime(total * timeNormalisation)}</td>
                                <td colspan="2"></td>
                            </tr>`);
                            logsTable.append(projectTotalRow);

                            if (selected) {
                                categoryTotal += total;
                                dayTotal += total;
                            }
                        }
                    };
                }(dailyCategoryView));

                // Total per category
                const categoryTotalRow = $(`<tr class="total">
                    <td class="key"></td>
                    <td><span>${Utils.escapeHTML(category.getName())}</span></td> <!-- Category -->
                    <th>TOTAL</th>
                    <th colspan="2"></th>
                    <td>${Utils.formatTotalTime(categoryTotal)}</td>
                    <td>${Utils.formatTotalTime(categoryTotal * timeNormalisation)}</td>
                    <td colspan="2"></td>
                </tr>`);
                logsTable.append(categoryTotalRow);
            };
        }(this));

        const spacerRow = $(`<tr class="spacer">
            <td class="key"></td>
            <th colspan="7"></th>
        </tr>`);
        logsTable.append(spacerRow);

        const dayTotalRow = $(`<tr class="total">
            <td class="key"></td>
            <td></td> <!-- Category -->
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
