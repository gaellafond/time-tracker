const getCurrentTimestamp = function() {
    return Math.floor(new Date() / 1000);
};

const formatTime = function(s) {
    // https://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript

    // Pad to 2 or 3 digits, default is 2
    let pad = function(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    };

    s = Math.floor(s);
    let secs = s % 60;
    s = Math.floor(s / 60);
    let mins = s % 60;
    let hrs = Math.floor(s / 60);

    return hrs + ':' + pad(mins) + ':' + pad(secs);
};

$(document).ready(function() {
    // Create dummy projects
    //let lunch = new Project("Lunch", "#FFFF00", 1);
    //let eAtlas = new Project("eAtlas", "#0000FF", 2);

    const newProjectBox = $("#new-project");
    const projects = Project.getAll();
    projects.forEach(project => {
        // Insert the JQuery element to the page Markup, before the "New Project" box
        newProjectBox.before(project.getMarkup());
    });
});
