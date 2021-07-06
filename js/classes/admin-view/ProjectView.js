class ProjectView extends AbstractView {

    constructor(admin) {
        super(admin);
    }

    render() {
        let categoriesTable = $(`<table class="projects-table">
            <tr class="header">
                <th class="key">Key</th>
                <th>Category name</th>
                <th>Order</th>
                <th class="delete-column">X</th>
            </tr>
        </table>`);

        const categories = this.admin.timeTracker.getCategories();
        $.each(categories, function(projectView) {
            return function(categoryIndex, category) {
                if (category.isUncategoriseCategory()) {
                    categoriesTable.append(`<tr>
                        <td class="key">${category.getKey()}</td>
                        <td>${Utils.escapeHTML(category.getName())}</td>
                        <td>N/A</td>
                        <td></td>
                    </tr>`);
                } else {
                    // Editable category
                    const categoryRow = $(`<tr>
                        <td class="key">${category.getKey()}</td>
                        <td>${Utils.escapeHTML(category.getName())}</td>
                    </tr>`);


                    let categoryOrderCellEl = $(`<td></td>`);
                    let categoryOrderSelect = $(`<select class="categoryOrder"></select>`);
                    for (let i=1; i<=categories.length-1; i++) {
                        const selected = i === category.getOrder();
                        categoryOrderSelect.append($(`<option value="${i}" ${selected ? "selected=\"selected\"" : ""}>${i}</option>`));
                    }
                    categoryOrderCellEl.append(categoryOrderSelect);
                    categoryRow.append(categoryOrderCellEl);

                    categoryOrderSelect.change(function(projectView, category) {
                        return function() {
                            let newValue = $(this).val();
                            if (isNaN(newValue)) {
                                return false;
                            }
                            const oldOrder = category.getOrder();
                            const newOrder = parseInt(newValue);
                            if (oldOrder === newOrder) {
                                // The new value is basically equivalent, something like 2 === 2.0
                                return false;
                            }

                            if (oldOrder > newOrder) {
                                // Why -0.5?
                                // If the project was in position 5 and the user input 2 (for example),
                                // we change the value to 1.5, which mean the project will be placed
                                // between 1 and 2, therefore getting position 2 after fixing project orders.
                                category.setOrder(newOrder - 0.5);
                            } else {
                                // Why +0.5?
                                // If the project was in position 2 and the user input 5 (for example),
                                // we change the value to 5.5, which mean the project will be placed
                                // between 5 and 6, therefore getting position 5 after fixing project orders,
                                // considering the moved project won't be in position 2 anymore.
                                category.setOrder(newOrder + 0.5);
                            }

                            category.save();
                            projectView.admin.timeTracker.fixProjectOrder();
                            projectView.admin.render();
                            projectView.admin.dirty = true;
                        };
                    }(projectView, category));


                    let deleteCellEl = $(`<td class="delete-column"></td>`);
                    let deleteCellButtonEl = $(`<button class="delete">X</button>`);
                    deleteCellEl.append(deleteCellButtonEl);
                    categoryRow.append(deleteCellEl);

                    deleteCellButtonEl.click(function(projectView, category) {
                        return function() {
                            // NOTE: No character need escaping in a "confirm" window
                            const warningMessage =
                                "Are you sure you want to delete this category?\n" +
                                "    Category: " + category.getName()
                            if (window.confirm(warningMessage)) {
                                category.delete();
                                projectView.admin.timeTracker.reload();
                                projectView.admin.timeTracker.fixProjectOrder();
                                projectView.admin.render();
                                projectView.admin.dirty = true;
                            }
                        };
                    }(projectView, category));


                    categoriesTable.append(categoryRow);
                }

                // Add category's projects
                const projects = category.getProjects();
                if (projects && projects.length > 0) {
                    const categoryProjectsRow = $(`<tr></tr>`);
                    const categoryProjectsKeyCell = $(`<td class="key"></td>`);
                    const categoryProjectsCell = $(`<td colspan=3></td>`);
                    categoryProjectsCell.append(projectView.renderCategoryTable(projects));

                    categoryProjectsRow.append(categoryProjectsKeyCell);
                    categoryProjectsRow.append(categoryProjectsCell);
                    categoriesTable.append(categoryProjectsRow);
                }
            };
        }(this));

        return categoriesTable;
    }

    renderCategoryTable(projects) {
        let projectTable = $(`<table class="projects-table">
            <tr class="header">
                <th class="key">Key</th>
                <th>Project name</th>
                <th>Colour</th>
                <th>Category</th>
                <th>Order</th>
                <th class="delete-column">X</th>
            </tr>
        </table>`);
        $.each(projects, function(projectView) {
            return function(projectIndex, project) {
                const selected = project.isSelected();
                const rowClass = selected ? "selected" : "not-selected";

                let projectTableRow = $(`<tr class="${rowClass}" style="background-color: ${project.getBackgroundColour()}">
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

                projectColourSelect.change(function(projectView, project) {
                    return function() {
                        project.setColourIndex($(this).val());
                        project.save();
                        projectView.admin.render();
                        projectView.admin.dirty = true;
                    };
                }(projectView, project));
                projectTableRow.append(projectColourCellEl);


                let projectCategoryCellEl = $(`<td></td>`);
                let projectCategorySelect = $(`<select class="projectCategory"></select>`);
                const categoryMap = projectView.admin.timeTracker.getCategoryMap();
                $.each(categoryMap, function(categoryKey, category) {
                    const selected = categoryKey === project.getCategoryKey();
                    projectCategorySelect.append($(`<option value="${categoryKey}" ${selected ? "selected=\"selected\"" : ""}>${category.getName()}</option>`));
                });
                projectCategoryCellEl.append(projectCategorySelect);

                projectCategorySelect.change(function(projectView, project) {
                    return function() {
                        project.setCategoryKey($(this).val());
                        project.save();
                        projectView.admin.render();
                        projectView.admin.dirty = true;
                    };
                }(projectView, project));
                projectTableRow.append(projectCategoryCellEl);


                let projectOrderCellEl = $(`<td></td>`);
                let projectOrderSelect = $(`<select class="projectOrder"></select>`);
                for (let i=1; i<=projects.length; i++) {
                    const selected = i === project.getOrder();
                    projectOrderSelect.append($(`<option value="${i}" ${selected ? "selected=\"selected\"" : ""}>${i}</option>`));
                }
                projectOrderCellEl.append(projectOrderSelect);

                projectOrderSelect.change(function(projectView, project) {
                    return function() {
                        let newValue = $(this).val();
                        if (isNaN(newValue)) {
                            return false;
                        }
                        const oldOrder = project.getOrder();
                        const newOrder = parseInt(newValue);
                        if (oldOrder === newOrder) {
                            // The new value is basically equivalent, something like 2 === 2.0
                            return false;
                        }

                        if (oldOrder > newOrder) {
                            // Why -0.5?
                            // If the project was in position 5 and the user input 2 (for example),
                            // we change the value to 1.5, which mean the project will be placed
                            // between 1 and 2, therefore getting position 2 after fixing project orders.
                            project.setOrder(newOrder - 0.5);
                        } else {
                            // Why +0.5?
                            // If the project was in position 2 and the user input 5 (for example),
                            // we change the value to 5.5, which mean the project will be placed
                            // between 5 and 6, therefore getting position 5 after fixing project orders,
                            // considering the moved project won't be in position 2 anymore.
                            project.setOrder(newOrder + 0.5);
                        }

                        project.save();
                        projectView.admin.timeTracker.fixProjectOrder();
                        projectView.admin.render();
                        projectView.admin.dirty = true;
                    };
                }(projectView, project));
                projectTableRow.append(projectOrderCellEl);


                let deleteCellEl = $(`<td class="delete-column"></td>`);
                let deleteCellButtonEl = $(`<button class="delete">X</button>`);
                deleteCellEl.append(deleteCellButtonEl);
                projectTableRow.append(deleteCellEl);

                deleteCellButtonEl.click(function(projectView, project) {
                    return function() {
                        // NOTE: No character need escaping in a "confirm" window
                        const warningMessage =
                            "Are you sure you want to delete this project?\n" +
                            "    Project: " + project.getName()
                        if (window.confirm(warningMessage)) {
                            project.delete();
                            projectView.admin.timeTracker.reload();
                            projectView.admin.timeTracker.fixProjectOrder();
                            projectView.admin.render();
                            projectView.admin.dirty = true;
                        }
                    };
                }(projectView, project));

                projectTable.append(projectTableRow);

                let projectLogsRow = $(`<tr><td class="key"></td></tr>`);
                let projectLogsCell = $(`<td colspan="5" style="background-color: ${project.getBackgroundColour()}"></td>`);
                projectLogsCell.append(projectView._renderProjectLogTable(project));

                projectLogsRow.append(projectLogsCell);
                projectTable.append(projectLogsRow);
            }
        }(this));

        return projectTable;
    }

    _renderProjectLogTable(project) {
        const timeNormalisation = this.admin.timeTracker.getTimeNormalisationPercentage();

        const selected = project.isSelected();
        const rowClass = selected ? "selected" : "not-selected";

        let logs = project.getLogs([this.admin.getDateFilter(), this.admin.getSearchFilter()]);
        if (logs !== null && logs.length > 0) {
            let logsTable = $(`<table class="logs-table">
                <tr class="header ${rowClass}">
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
            $.each(logs, function(projectView) {
                return function(logIndex, log) {
                    if (lastWeekNumber === null) {
                        lastWeekNumber = Utils.getWeekNumber(log.getStartDate());
                    }
                    currentWeekNumber = Utils.getWeekNumber(log.getStartDate());

                    if (lastWeekNumber !== currentWeekNumber) {
                        logsTable.append(projectView._getTotalRow(totalTime, selected));
                        totalRowCount++;
                        totalTime = 0;
                        lastTotalWeekNumber = lastWeekNumber;
                    }

                    let elapseTime = log.getElapseTime();
                    grandTotalTime += elapseTime;
                    totalTime += elapseTime;

                    let logRow = $(`<tr class="${rowClass}">
                        <td class="key">${log.getKey()}</td>
                    </tr>`);

                    let weekdayCellEl = $(`<td></td>`);
                    let weekdayCellDataEl = $(`<span>${Utils.getWeekday(log.getStartDate())}</span>`);
                    weekdayCellEl.append(weekdayCellDataEl);

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

                    logRow.append(weekdayCellEl);
                    logRow.append(startDateCellEl);
                    logRow.append(endDateCellEl);
                    logRow.append(elapseTimeCellEl);
                    logRow.append(elapseTimeNormalisedCellEl);
                    logRow.append(messageCellEl);
                    logRow.append(deleteCellEl);

                    new EditableString(startDateCellDataEl, projectView.getEditLogStartDateFunction(log));
                    new EditableString(endDateCellDataEl, projectView.getEditLogEndDateFunction(log));
                    new EditableString(messageCellDataEl, projectView.getEditLogMessageFunction(log));
                    deleteCellButtonEl.click(projectView.getDeleteLogFunction(log));

                    logsTable.append(logRow);

                    lastWeekNumber = currentWeekNumber;
                };
            }(this));

            if (lastTotalWeekNumber !== currentWeekNumber) {
                logsTable.append(this._getTotalRow(totalTime, selected));
                totalRowCount++;
            }

            if (totalRowCount > 1) {
                const spacerRow = $(`<tr class="spacer">
                    <td class="key"></td>
                    <th colspan="7"></th>
                </tr>`);
                logsTable.append(spacerRow);

                logsTable.append(this._getTotalRow(grandTotalTime, selected, "GRAND TOTAL"));
            }

            return logsTable;
        }

        return null;
    }

    _getTotalRow(total, selected, label) {
        label = label ? label : "TOTAL";
        const rowClass = selected ? "selected" : "not-selected";

        const timeNormalisation = this.admin.timeTracker.getTimeNormalisationPercentage();

        let totalRow = $(`<tr class="total ${rowClass}">
            <td class="key"></td>
            <th colspan="3">${label}</th>
        </tr>`);

        let totalCellEl = $(`<td></td>`);
        let totalCellDataEl = $(`<span>${Utils.formatTotalTime(total)}</span>`);
        totalCellEl.append(totalCellDataEl);

        let totalNormalisedCellEl = $(`<td></td>`);
        let totalNormalisedCellDataEl = $(`<span>${Utils.formatTotalTime(total * timeNormalisation)}</span>`);
        totalNormalisedCellEl.append(totalNormalisedCellDataEl);

        totalRow.append(totalCellEl);
        totalRow.append(totalNormalisedCellEl);

        // Filler
        totalRow.append(`<td colspan="2"></td>`);

        return totalRow;
    }

}
