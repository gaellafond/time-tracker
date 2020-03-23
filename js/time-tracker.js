// DEBUG
const reset = function() {
    window.localStorage.clear();
    location.reload();
};

let timeTracker = null;
const checkOut = function() {
    timeTracker.stopLogCounter();
};

$(document).ready(function() {
    timeTracker = new TimeTracker($("#dashboard"));
});
