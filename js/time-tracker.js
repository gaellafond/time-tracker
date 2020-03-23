// DEBUG
const reset = function() {
    window.localStorage.clear();

    // Create dummy projects
    let lunch = new Project("Lunch", 0, 1);
    lunch.save();

    let eAtlas = new Project("eAtlas", 1, 2);
    eAtlas.save();

    location.reload();
};

$(document).ready(function() {
    const newProjectBox = $("#new-project");

    newProjectBox.find("button.new").click(function() {
        let projects = Project.getAll();
        let lastProject = projects[projects.length-1];
        let newProject = new Project("New project", lastProject.getBackgroundColourIndex() + 1, lastProject.getOrder() + 1);
        newProject.save();
        newProjectBox.before(newProject.getMarkup());
    });

    const projects = Project.getAll(); // TODO Use Project.map instead
    projects.forEach(project => {
        // Insert the JQuery element to the page Markup, before the "New Project" box
        newProjectBox.before(project.getMarkup());
    });
});
