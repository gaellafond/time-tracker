class EditableString {
    constructor(spanEl, onChangeCallback) {
        this.spanEl = spanEl;
        this.onChangeCallback = onChangeCallback;
        this.autoSelect = false;
        this.cssClass = "";

        this.spanEl.click(function(editableString) {
            return function() {
                editableString.toggleEditOn();
            };
        }(this));
    }

    // Auto select the text content when toggling edit mode, for easy text replacement.
    setAutoSelect(autoSelect) {
        this.autoSelect = !!autoSelect;
    }

    setInputCssClass(cssClass) {
        this.cssClass = cssClass;
    }

    toggleEditOn() {
        if (!this.inputEl) {
            this.spanEl.hide();
            this.inputEl = $(`<input class="${this.cssClass}" type="text" value="${this.spanEl.text()}">`);
            this.spanEl.after(this.inputEl);
            if (this.autoSelect) {
                this.inputEl.select(); // Select the text in the text field
            } else {
                this.inputEl.focus(); // Put the cursor in the input field to start editing
            }

            const changeFunction = function(editableString) {
                return function() {
                    editableString.toggleEditOff();
                };
            }(this);

            // Update the field value when...
            this.inputEl.change(changeFunction); // The user tape "enter"
            this.inputEl.focusout(changeFunction); // The user click somewhere else in the page
        }
    }

    toggleEditOff() {
        if (this.inputEl) {
            // Get the new value from the input field
            const newValue = this.inputEl.val();

            // Set the new name on the markup and in the Project object
            this.spanEl.html(Utils.escapeHTML(newValue));

            // Call the callback, to save the value to the Database
            this.onChangeCallback(newValue);

            // Delete the input field and show the changed element
            this.inputEl.remove();
            this.spanEl.show();

            this.inputEl = null;
        }
    }
}
