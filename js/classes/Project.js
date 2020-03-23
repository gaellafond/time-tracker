class Project extends PersistentObject {
    constructor(name, bgColourIndex, order, key=null) {
        if (key === null) {
            super(Project.keyPrefix, false);
            console.log("CREATING PROJECT: " + this.getKey());
        } else {
            super(key, true);
            console.log("LOADING PROJECT: " + this.getKey() + " order: " + order);
        }

        Project.map[this.getKey()] = this;

        this.name = name;
        this.bgColourIndex = bgColourIndex;
        this.order = order;
        this.logs = []; // TODO

        let projectMarkup = `
            <div class="project" draggable="true" data-projectkey="${this.getKey()}" style="background-color: ${this.getBackgroundColour()}">
                <h2 class="title">${this.getName()}</h2>
                <div class="logs">
        `;

        // TODO Add logs
        /*
                    $logs = $project->getLogs();
                    $currentLogDate = null;
                    foreach ($logs as $log) {
                        $logId = $log->getId();
                        $logDate = $log->getDateStr();
                        $logDuration = $log->getDurationStr();
                        $logMessage = $log->getMessage();
                        $logStartDate = $log->getStartDate();
                        $logEndDate = $log->getEndDate();
                        if ($logDate !== $currentLogDate) {
                            $currentLogDate = $logDate;
                            ?>
                            <div><span class="date"><?=$logDate ?></span></div>
                            <?php
                        }
                        ?>
                        <div><span class="time" data-logid="<?=$logId ?>" data-startdate="<?=$logStartDate ?>" data-enddate="<?=($logEndDate ? $logEndDate : '') ?>"><?=$logDuration ?></span> - <?=$logMessage ?></div>
                        <?php
                    }
        */

        projectMarkup += `
                </div>
                <div class="buttons"><button class="start">Start</button></div>
            </div>
        `;

        // Create the JQuery element
        this.markup = $(projectMarkup);

        // Drag and drop events
        // See: https://www.w3schools.com/html/html5_draganddrop.asp

        // Save dragged project key in the event
        // this = dragged project
        this.markup.on("dragstart", function(draggedProject) {
            return function(event) {
                event.originalEvent.dataTransfer.setData("text", draggedProject.getKey());
            };
        }(this));

        // Tell the browser the project can be dropped on another project
        // this = project under the dragged project
        this.markup.on("dragover", function(event) {
            event.preventDefault();
        });

        // The dragged project was drop on another project
        // this = drop on project
        this.markup.on("drop", function(dropOnProject) {
            return function(event) {
                event.preventDefault();
                const draggedProjectKey = event.originalEvent.dataTransfer.getData("text");
                const draggedProject = Project.map[draggedProjectKey];

                const draggedProjectOrder = draggedProject.getOrder();
                const dropOnProjectOrder = dropOnProject.getOrder();
                const newOrder = dropOnProjectOrder;
                if (draggedProjectOrder > dropOnProjectOrder) {
                    $.each(Project.map, function(projectKey, project) {
                        let projectOrder = project.getOrder();
                        if (projectOrder >= dropOnProjectOrder) {
                            project.setOrder(projectOrder + 1);
                            project.save();
                        }
                    });
                } else if (draggedProjectOrder < dropOnProjectOrder) {
                    $.each(Project.map, function(projectKey, project) {
                        let projectOrder = project.getOrder();
                        if (projectOrder >= draggedProjectOrder) {
                            project.setOrder(projectOrder - 1);
                            project.save();
                        }
                    });
                }
                draggedProject.setOrder(newOrder);
                draggedProject.save();

                location.reload(); // TODO Do it live on the markup
            };
        }(this));

        // Add click event on start button
        this.markup.find("button.start").click(function(project) {
            return function() {
                project.addLog();
            };
        }(this));

        // Add click event on title (edit)
        this.markup.find("h2.title").click(function(project) {
            return function() {
                // Hide the title (it will be replaced with a input field)
                const titleEl = $(this);
                titleEl.hide();

                // Create an input field, add it in the markup after the (hidden) title
                const inputEl = $(`<input class="title" type="text" value="${project.getName()}">`);
                titleEl.after(inputEl);
                inputEl.select(); // Select the text in the text field

                const changeFunction = function(inputEl) {
                    return function() {
                        // Get the new project name that was typed
                        const newName = inputEl.val();

                        // Set the new name on the markup and in the Project object
                        titleEl.html(newName);
                        project.setName(newName);
                        project.save();

                        // Delete the input field and show the changed title
                        inputEl.remove();
                        titleEl.show();
                    };
                }(inputEl);

                // Update the project name when
                inputEl.change(changeFunction); // The user tape "enter"
                inputEl.focusout(changeFunction); // The user click somewhere else in the page
            };
        }(this));
    }

    static get keyPrefix() {
        return "project";
    }

    static getBackgroundColour(colourIndex) {
        const colours = [
            "#ccffff",
            "#ccccff",
            "#ffccff",
            "#ffcccc",
            "#ffffcc",
            "#ccffcc"
        ];

        return colours[colourIndex % colours.length];
    }

    static get(projectKey) {
        return Project.load(PersistentObject.load(projectKey));
    }

    static getAll() {
        let jsonProjects = PersistentObject.getAllJSON(Project.keyPrefix);

        let projects = [];
        jsonProjects.forEach(jsonProject => {
            projects.push(Project.load(jsonProject));
        });

        // Sort projects by order
        projects.sort(function (a, b) {
            return a.getOrder() - b.getOrder();
        });

        return projects;
    }

    static load(jsonProject) {
        return new Project(
            jsonProject.name,
            jsonProject.bgColourIndex,
            jsonProject.order,
            jsonProject.key
        );
    }

    addLog() {
        const log = new Log(this, this.guessNextLogName(), Log.getCurrentTimestamp(), null);
        this.logs.push(log);
        this.markup.find(".logs").append(log.getMarkup());

        log.startCounter();
    }
    getLogs() {
        return this.logs;
    }

    getMarkup() {
        return this.markup;
    }

    setActive(active) {
        if (active) {
            this.markup.addClass('active');
        } else {
            this.markup.removeClass('active');
        }
    }
    isActive() {
        this.markup.hasClass('active');
    }

    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }

    guessNextLogName() {
        return this.name;
    }

    getBackgroundColourIndex() {
        return this.bgColourIndex;
    }
    setBackgroundColour(bgColourIndex) {
        this.bgColourIndex = bgColourIndex;
    }

    getBackgroundColour() {
        return Project.getBackgroundColour(this.bgColourIndex);
    }

    getOrder() {
        return this.order;
    }
    setOrder(order) {
        this.order = order;
    }

    toJson() {
        return {
            "key": this.getKey(),
            "name": this.name,
            "bgColourIndex": this.bgColourIndex,
            "order": this.order
        }
    }
}

Project.map = {};