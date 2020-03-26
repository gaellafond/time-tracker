let timeRibbon = null;
let timeTracker = null;

const checkOut = function() {
    timeTracker.stopLogCounter();
};

const showAdmin = function() {
    timeTracker.showAdmin();
};

$(document).ready(function() {
    timeTracker = new TimeTracker($("#dashboard"));
    timeRibbon = new TimeRibbon($("#time-ribbon"), timeTracker);
    timeRibbon.render([Utils.formatDate(Utils.getCurrentTimestamp())]);
});
