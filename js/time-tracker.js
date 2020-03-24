// DEBUG
const reset = function() {
    window.localStorage.clear();
    location.reload();
};

let timeTracker = null;
const checkOut = function() {
    timeTracker.stopLogCounter();
};

const exportCSV = function() {
    timeTracker.exportCSV();
};

$(document).ready(function() {
    timeTracker = new TimeTracker($("#dashboard"));
});
