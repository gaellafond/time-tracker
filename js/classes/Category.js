class Category extends PersistentObject {
    constructor(timeTracker, name, order, key=null) {
        if (key === null) {
            super(Category.keyPrefix, false);
        } else {
            super(key, true);
        }

        this.categoryClass = "category";
        this.timeTracker = timeTracker;
        this.name = name;
        this.order = order;

        this.projectMap = {};

        this.markup = null;
    }

    static get keyPrefix() {
        return "cat";
    }

    static load(timeTracker, jsonCategory) {
        return new Category(
            timeTracker,
            jsonCategory.name,
            jsonCategory.order,
            jsonCategory.key
        );
    }

    getCategoryClass() {
        return this.categoryClass;
    }
    // Needs to be called before "getMarkup()"
    setCategoryClass(categoryClass) {
        this.categoryClass = categoryClass;
    }

    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }

    getOrder() {
        return this.order;
    }
    setOrder(order) {
        this.order = order;
    }

    addProject(project) {
        this.projectMap[project.getKey()] = project;
        project.setCategoryKey(this.getKey());
    }
    removeProject(project) {
        delete this.projectMap[project.getKey()];
        project.setCategoryKey(null);
    }
    getProjectMap() {
        return this.projectMap;
    }
    getProjects() {
        // Return an array of projects, ordered by "order"
        return TimeTracker.sortProjectArray(Object.values(this.projectMap));
    }

    getMarkup() {
        if (this.markup == null) {
            // Create the JQuery element
            this.markup = $(`
                <fieldset class="${this.getCategoryClass()}"><legend class="category-header">${this.getName()}</legend></fieldset>
            `);

            const editableCategoryName = new EditableCategoryName(this.markup.find("legend.category-header"), function(category) {
                return function(oldValue, newValue) {
                    category.setName(newValue);
                    category.save();
                };
            }(this));
            editableCategoryName.setAutoSelect(true);
            editableCategoryName.setInputCssClass("category-header");

            this.addEventListeners();
        }
        return this.markup;
    }

    addEventListeners() {
        // Tell the browser that projects can be dropped on this category.
        this.markup.on("dragover", function(event) {
            event.preventDefault();
        });

        // A project was drop on the category project
        // this = drop on category
        this.markup.on("drop", function(dropOnCategory) {
            return function(event) {
                event.preventDefault();
                const draggedProject = dropOnCategory.timeTracker.draggedProject;
                if (draggedProject != null && dropOnCategory instanceof Category) {
                    dropOnCategory.timeTracker.draggedProject = null;
                    dropOnCategory.moveProjectOn(draggedProject);
                }
            };
        }(this));
    }

    moveProjectOn(draggedProject) {
        const currentCategory = draggedProject.getCategory();
        if (currentCategory !== this) {
            currentCategory.removeProject(draggedProject);
            this.addProject(draggedProject);
            draggedProject.setOrder(this.getHigherOrder() + 1);
            draggedProject.save();
            this.timeTracker.fixProjectOrder();
        }
    }

    getHigherOrder() {
        let higherOrder = 0;
        $.each(this.projectMap, function(projectKey, project) {
            if (project.getOrder() > higherOrder) {
                higherOrder = project.getOrder();
            }
        });

        return higherOrder;
    }

    // Used to re-order project after a drag n drop
    reloadProjectsMarkup() {
        // Remove project markup from current category, if any
        this.markup.find(".project").remove();

        const projects = this.getProjects();
        const newProjectBox = this.markup.find(".new-project");

        if (newProjectBox.length) {
            $.each(projects, function(category) {
                return function(index, project) {
                    // Insert the JQuery element to the page Markup, before the "New Project" box
                    newProjectBox.before(project.getMarkup());
                    project.scrollToBottom();
                    project.addEventListeners();
                };
            }(this));
        } else {
            $.each(projects, function(category) {
                return function(index, project) {
                    // Insert the JQuery element to the page Markup
                    category.markup.append(project.getMarkup());
                    project.scrollToBottom();
                    project.addEventListeners();
                };
            }(this));
        }
    }

    toJson() {
        return {
            "key": this.getKey(),
            "name": this.name,
            "order": this.order
        }
    }

}
