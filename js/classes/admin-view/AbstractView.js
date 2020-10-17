/**
 * This class doesn't do anything.
 * It's just to describe the methods
 * that needs to be defined in Views
 */
class AbstractView {
    constructor(admin) {
        this.admin = admin;
    }

    // Abstract method to define
    render() { }

    // Common methods used by pretty much every views

    getEditLogProjectFunction(log) {
        return function(view) {
            return function(oldProject, newProject) {
                log.setProject(newProject);
                view.admin.timeTracker.reloadProjects();
                view.admin.render();
                view.admin.dirty = true;
            }
        }(this);
    }

    getEditLogStartDateFunction(log) {
        return function(view) {
            return function(oldValue, newValue) {
                const newDate = Utils.parseDatetime(newValue);
                if (newDate && newDate <= log.getEndDate()) {
                    log.setStartDate(newDate);
                    log.save();
                    view.admin.timeTracker.flagOverlappingLogs();
                    view.admin.render();
                    view.admin.dirty = true;
                } else {
                    return false;
                }
            }
        }(this);
    }

    getEditLogEndDateFunction(log) {
        return function(view) {
            return function(oldValue, newValue) {
                const newDate = Utils.parseDatetime(newValue);
                if (newDate && newDate >= log.getStartDate()) {
                    log.setEndDate(newDate);
                    log.save();
                    view.admin.timeTracker.flagOverlappingLogs();
                    view.admin.render();
                    view.admin.dirty = true;
                } else {
                    return false;
                }
            }
        }(this);
    }

    getEditLogMessageFunction(log) {
        return function(view) {
            return function(oldValue, newValue) {
                log.setMessage(newValue);
                log.save();
                view.admin.render();
                view.admin.dirty = true;
            }
        }(this);
    }

    getDeleteLogFunction(log) {
        return function(view) {
            return function() {
                // NOTE: No character need escaping in a "confirm" window
                const warningMessage =
                    "Are you sure you want to delete this log?\n" +
                    "    Log: " + log.getMessage() + "\n" +
                    "    Project: " + log.getProject().getName()
                if (window.confirm(warningMessage)) {
                    log.delete();
                    view.admin.timeTracker.reload();
                    view.admin.render();
                    view.admin.dirty = true;
                }
            };
        }(this);
    }
}
