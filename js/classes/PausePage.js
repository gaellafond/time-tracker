class PausePage {

    constructor(timeTracker) {
        this.timeTracker = timeTracker;
        this.overlayMarkup = $("body .overlay");

        this.markup = $(
        `<div class="pause-page">
            <div class="buttons">
                <button class="resume">Resume</button>
            </div>
        </div>`);

        this.resumeButtonEl = this.markup.find("button.resume");
        this.resumeButtonEl.click(function (pausePage) {
            return function() {
                pausePage.resume();
            };
        }(this));

        const body = $("body");
        body.prepend(this.markup);

        this.init();
    }

    init() {
        if (this.isPaused()) {
            this.show();
        }
    }

    pause() {
        if (!this.isPaused()) {
            const runningLog = this.timeTracker.runningLog;
            if (runningLog) {
                const jsonTimeTrackerPauseData = {
                    "pausedLog": runningLog.toJson(),
                };

                Utils.localStorageSetItem('timeTrackerPauseData', JSON.stringify(jsonTimeTrackerPauseData));
                this.timeTracker.stopLogCounter();
            }
        }

        if (this.isPaused()) {
            this.show();
        }
    }

    resume() {
        const timeTrackerPauseDataStr = Utils.localStorageGetItem('timeTrackerPauseData');
        if (timeTrackerPauseDataStr) {
            const jsonTimeTrackerPauseData = JSON.parse(timeTrackerPauseDataStr);
            const jsonPausedLog = jsonTimeTrackerPauseData["pausedLog"];
            if (jsonPausedLog) {
                const pausedLog = Log.load(this.timeTracker, jsonPausedLog);
                const pausedLogProject = pausedLog.project;
                if (pausedLogProject) {
                    pausedLogProject.addLog();
                }
            }
        }

        Utils.localStorageRemoveItem('timeTrackerPauseData');

        this.hide();
    }

    isPaused() {
        return !!Utils.localStorageGetItem('timeTrackerPauseData');
    }

    show() {
        this.overlayMarkup.show();
        this.markup.show();
    }

    hide() {
        this.overlayMarkup.hide();
        this.markup.hide();
    }
}
