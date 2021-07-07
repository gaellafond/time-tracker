class EditableProject {
    constructor(spanEl, timeTracker, project, onChangeCallback, afterEditCallback) {
        this.timeTracker = timeTracker;
        this.project = project;
        this.spanEl = spanEl;
        this.spanEl.addClass("editableString");

        this.onChangeCallback = onChangeCallback;
        this.afterEditCallback = afterEditCallback;

        this.spanEl.click(function(editableString) {
            return function() {
                editableString.toggleEditOn();
            };
        }(this));
    }

    toggleEditOn() {
        if (!this.inputEl) {
            this.spanEl.hide();
            this.inputEl = $(`<select class="editableProjectSelect"></select>`);

            const projectMap = this.timeTracker.getProjectMap();
            $.each(projectMap, function(editableProject) {
                return function(projectKey, project) {
                    const selected = editableProject.project.getKey() === project.getKey();
                    editableProject.inputEl.append(`<option style="background-color: ${project.getBackgroundColour()}" value="${Utils.escapeHTML(project.getKey())}" ${selected ? "selected" : ""}>${Utils.escapeHTML(project.getName())}</option>`);
                };
            }(this));

            this.spanEl.after(this.inputEl);
            this.inputEl.focus(); // Put the cursor in the input field to start editing

            const changeFunction = function(editableString) {
                return function() {
                    editableString.toggleEditOff();
                };
            }(this);

            // Update the field value when...
            this.inputEl.change(changeFunction); // The user selected a project
            this.inputEl.focusout(changeFunction); // The user clicked somewhere else in the page
        }
    }

    toggleEditOff() {
        if (this.inputEl) {
            // Get the old value from the span element
            const oldProjectKey = this.project.getKey();
            // Get the new value from the input field
            const newProjectKey = this.inputEl.val().trim();

            // Delete the input field now, to prevent multiple call of "toggleEditOff"
            this.inputEl.remove();
            this.inputEl = null;

            if (newProjectKey !== oldProjectKey) {
                const projectMap = this.timeTracker.getProjectMap();
                const newProject = projectMap[newProjectKey];
                if (newProject) {
                    // Call the callback, to save the value to the Database
                    let success = true;
                    if (this.onChangeCallback) {
                        success = this.onChangeCallback(this.project, newProject);
                    }

                    // Set the new value in the html element, unless the callback explicitly returns false
                    if (success !== false) {
                        this.project = newProject;
                        this.spanEl.text(this.project.getName());
                        if (this.afterEditCallback) {
                            this.afterEditCallback(this.project, newProject);
                        }
                    }
                }
            }

            // Show the changed element
            this.spanEl.show();
        }
    }
}
