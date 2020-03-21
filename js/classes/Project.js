class Project extends PersistentObject {
    constructor(name, bgColour, order) {
        super(Project.keyPrefix, Project.keyPrefix + name);
        this.name = name;
        this.bgColour = bgColour;
        this.order = order;
        this.logs = []; // TODO

        let projectMarkup = `
            <div class="project" data-projectkey="${this.getKey()}" style="background-color: ${this.getBackgroundColour()}">
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

        // Add click event on start button
        this.markup.find("button.start").click(function(project) {
            return function() {
                project.addLog();
            };
        }(this));
    }

    static get keyPrefix() {
        return "project_";
    }

    static get(projectId) {
        PersistentObject.load(projectId);
    }

    static getAll() {
        let jsonProjects = PersistentObject.getAllJSON(Project.keyPrefix);

        let projects = [];
        jsonProjects.forEach(jsonProject => {
            projects.push(new Project(
                jsonProject.name,
                jsonProject.bgColour,
                jsonProject.order
            ));
        });

        // Sort projects by order
        projects.sort(function (a, b) {
            return a.getOrder() - b.getOrder();
        });

        return projects;
    }

    addLog() {
        const log = new Log(this, this.guessNextLogName(), getCurrentTimestamp(), null);
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

    getBackgroundColour() {
        return this.bgColour;
    }
    setBackgroundColour(bgColour) {
        this.bgColour = bgColour;
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
            "bgColour": this.bgColour,
            "order": this.order
        }
    }
}
