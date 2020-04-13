class Admin {

    constructor(timeTracker) {
        this.dirty = false;

        this.timeTracker = timeTracker;
        this.overlayMarkup = $(`<div class="overlay"></div>`);
        this.markup = $(
        `<div class="admin-wrapper">
            <div class="admin">
                <div class="header-buttons">
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

    renderProjectEditor() {
        this.destroyProjectEditor();
        const projects = this.timeTracker.getProjects();

        let projectTable = $(`<table class="projects-table">
            <tr>
                <th>Key</th>
                <th>Name</th>
                <th>Colour code</th>
            </tr>
        </table>`);
        $.each(projects, function(admin) {
            return function(projectIndex, project) {
                let projectTableRow = $(`<tr style="background-color: ${project.getBackgroundColour()}">
                    <td>${project.getKey()}</td>
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

                projectTable.append(projectTableRow);

                let projectLogsRow = $(`<tr></tr>`);
                let projectLogsCell = $(`<td colspan="3"></td>`);
                projectLogsCell.append(admin.renderProjectLogsEditor(project));

                projectLogsRow.append(projectLogsCell);
                projectTable.append(projectLogsRow);
            }
        }(this));

        this.projectEditorEl.append(projectTable);
    }

    renderProjectLogsEditor(project) {
        let logs = project.getLogs();
        if (logs !== null && logs.length > 0) {
            let logsTable = $(`<table class="logs-table">
                <tr>
                    <th>Key</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th>Message</th>
                </tr>
            </table>`);

            $.each(logs, function(admin) {
                return function(logIndex, log) {
                    let logRow = $(`<tr>
                        <td>${log.getKey()}</td>
                    </tr>`);

                    let startDateCellEl = $(`<td></td>`);
                    let startDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getStartDate())}</span>`);
                    startDateCellEl.append(startDateCellDataEl);

                    let endDateCellEl = $(`<td></td>`);
                    let endDateCellDataEl = $(`<span>${Utils.formatDateForEditor(log.getEndDate())}</span>`);
                    endDateCellEl.append(endDateCellDataEl);

                    let messageCellEl = $(`<td></td>`);
                    let messageCellDataEl = $(`<span>${Utils.escapeHTML(log.getMessage())}</span>`);
                    messageCellEl.append(messageCellDataEl);

                    logRow.append(startDateCellEl);
                    logRow.append(endDateCellEl);
                    logRow.append(messageCellEl);

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

                    logsTable.append(logRow);
                };
            }(this));

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
        }

        this.overlayMarkup.hide();
        this.markup.hide();

        this.adminTimeRibbon.destroy();
        this.destroyProjectEditor();
    }

    render() {
        this.adminTimeRibbon.render();
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