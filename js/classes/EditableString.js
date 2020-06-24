// onChangeCallback and afterEditCallback
// function(oldValue, newValue)
// Return false to cancel
class EditableString {
    constructor(spanEl, onChangeCallback, afterEditCallback) {
        this.spanEl = spanEl;
        this.spanEl.addClass("editableString");

        // This class do not allow empty string.
        // But the value might already be empty in the DB.
        // If it's the case, the user won't be able to click it to edit it
        // (you can't click an element with no width).
        // If this happens, set its value to something that can be selected by the user.
        if (!this.spanEl.text()) {
            this.spanEl.html('<em class="empty">EMPTY</em>');
        }

        this.onChangeCallback = onChangeCallback;
        this.afterEditCallback = afterEditCallback;
        this.autoSelect = false;
        this.allowEmpty = false;
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

    setAllowEmpty(allowEmpty) {
        this.allowEmpty = !!allowEmpty;
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
            // Get the old value from the span element
            const oldValue = this.spanEl.text();
            // Get the new value from the input field
            const newValue = this.inputEl.val().trim();

            if (newValue !== oldValue) {
                if (this.allowEmpty || newValue.length) {
                    // Call the callback, to save the value to the Database
                    let success = true;
                    if (this.onChangeCallback) {
                        success = this.onChangeCallback(oldValue, newValue);
                    }

                    // Set the new value in the html element, unless the callback explicitly returns false
                    if (success !== false) {
                        this.spanEl.text(newValue);
                        if (this.afterEditCallback) {
                            this.afterEditCallback(oldValue, newValue);
                        }
                    }
                }
            }

            // Delete the input field and show the changed element
            this.inputEl.remove();
            this.spanEl.show();

            this.inputEl = null;
        }
    }
}
