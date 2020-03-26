class Admin {

    constructor(timeTracker) {
        this.timeTracker = timeTracker;
        this.overlayMarkup = $(`<div class="overlay"></div>`);
        this.markup = $(
        `<div class="admin-wrapper">
            <div class="admin">
                <div style="text-align: right;"><button class="close">X</button></div>
                <div class="time-ribbon"></div>

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
        this.markup.show();

        this.adminTimeRibbon.render();
    }

    hide() {
        this.overlayMarkup.hide();
        this.markup.hide();

        this.adminTimeRibbon.destroy();
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