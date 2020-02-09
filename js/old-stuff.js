function formatTime(s) {
    // https://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript

    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    //return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
}

function start() {
    let overlay = document.getElementById("overlay");
    let modal = document.getElementById("modal");

    overlay.style.display = "block";
    modal.style.display = "block";
}

function cancel() {
    let overlay = document.getElementById("overlay");
    let modal = document.getElementById("modal");

    overlay.style.display = "none";
    modal.style.display = "none";
}
