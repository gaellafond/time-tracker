/*
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
*/


/*
let getCurrentTimestamp = function() {
    return Math.floor(new Date() / 1000);
};

let formatTime = function(s) {
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

let runningLogEl = null;
let runningInterval = null;
let stopCounter = function() {
    // Stop incrementing the counter on the screen
    window.clearInterval(runningInterval);
    runningInterval = null;

    // Save stop time in DB
    let logId = runningLogEl.attr('data-logid');
    // TODO send request!! update logId with endDate = getCurrentTimestamp()

    runningLogEl.parents(".project").removeClass('active');
    runningLogEl = null;
};
let startNewCounter = function(projectEl) {
    // TODO Create new log
    $.ajax('ajax/log.php', {
        type: 'POST',
        data: {
            "action": "save",
            "projectId": projectEl.attr('data-projectid'),
            "startDate": getCurrentTimestamp()
        },
        success: function(data, status, xhr) {
console.log(data);
            let startDate = data.startDate;
            let logId = data.id;
            let logMessage = data.message;
            projectEl.find(".logs").append('<div><span class="time" data-logid="' + logId + '" data-startdate="' + startDate + '" data-enddate="">0:00:00</span> - ' + logMessage + '</div>');
            startCounter(projectEl.find(".logs .time").last());
        },
        error: function(xhr, status, error) {
            console.log(xhr.responseJSON);
            console.log(error);
            // TODO Log error
        }
    });
};
let startCounter = function(logEl) {
    if (runningLogEl) {
        stopCounter();
    }
    runningLogEl = logEl;
    runningLogEl.parents('.project').addClass('active');

    let startDate = logEl.attr('data-startdate');
    runningInterval = window.setInterval(function() {
        let elapse = getCurrentTimestamp() - startDate;
        logEl.html(formatTime(elapse));
    }, 500);
};

let init = function() {
    // Start counter
    $(".time").filter(function() {
        return !$(this).attr('data-enddate');
    }).each(function() {
        startCounter($(this));
    });

    // Add click event on start buttons
    let startButtons = $("button.start").click(function() {
        startNewCounter($(this).parents('.project'));
    });
};
*/

// TODO Link buttons to Project object (hashmap?)
const loadProjectsMarkup = function() {
    // Load projects
    const projects = Project.getAll();
    let projectsMarkup = "";
    projects.forEach(project => {
        projectsMarkup += `
            <div class="project" data-projectkey="${project.getKey()}" style="background-color: ${project.getBackgroundColour()}">
                <h2 class="title">${project.getName()}</h2>
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

        projectsMarkup += `
                </div>
                <div class="buttons"><button class="start">Start</button></div>
            </div>
        `;
    });

    // Add "New Project" box
    projectsMarkup += `
        <div class="new project">
            <div class="buttons"><button class="new">New Project</button></div>
        </div>
    `;

    $("#dashboard").html(projectsMarkup);
};

let getCurrentTimestamp = function() {
    return Math.floor(new Date() / 1000);
};

let formatTime = function(s) {
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

let runningLogEl = null;
let runningInterval = null;
let stopCounter = function() {
    // Stop incrementing the counter on the screen
    window.clearInterval(runningInterval);
    runningInterval = null;

    // Save stop time in DB
    let logId = runningLogEl.attr('data-logid');
    // TODO send request!! update logId with endDate = getCurrentTimestamp()

    runningLogEl.parents(".project").removeClass('active');
    runningLogEl = null;
};
let startNewCounter = function(projectEl) {
    let startDate = getCurrentTimestamp();
    let logId = 0; // TODO
    let logMessage = 'TODO'; // TODO
    projectEl.find(".logs").append('<div><span class="time" data-logid="' + logId + '" data-startdate="' + startDate + '" data-enddate="">0:00:00</span> - ' + logMessage + '</div>');
    startCounter(projectEl.find(".logs .time").last());
};
let startCounter = function(logEl) {
    if (runningLogEl) {
        stopCounter();
    }
    runningLogEl = logEl;
    runningLogEl.parents('.project').addClass('active');

    let startDate = logEl.attr('data-startdate');
    runningInterval = window.setInterval(function() {
        let elapse = getCurrentTimestamp() - startDate;
        logEl.html(formatTime(elapse));
    }, 500);
};

const init = function() {
    // Create dummy projects
    //let lunch = new Project("Lunch", "#FFFF00", 1);
    //let eAtlas = new Project("eAtlas", "#0000FF", 2);

    loadProjectsMarkup();

    // Add click event on start buttons
    $("button.start").click(function() {
        startNewCounter($(this).parents('.project'));
    });
};

$(document).ready(function() {
    init();
});
