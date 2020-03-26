class Admin {

    constructor(timeTracker) {
        this.timeTracker = timeTracker;
        this.overlayMarkup = $(`<div class="overlay"></div>`);
        this.markup = $(
        `<div class="admin-wrapper"><div class="admin">
            <div style="text-align: right;"><button class="close">X</button></div>
            <div class="time-ribbon"></div>
        </div></div>`);

        this.markup.find("button.close").click(function(admin) {
            return function() {
                admin.hide();
            };
        }(this));

        const body = $("body");
        body.prepend(this.markup);
        body.prepend(this.overlayMarkup);

        this.adminTimeRibbon = new TimeRibbon(this.markup.find(".time-ribbon"), this.timeTracker);
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
}