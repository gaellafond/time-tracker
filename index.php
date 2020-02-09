<!DOCTYPE html>
<?php
    include_once 'classes/Project.php';
?>
<html>
<head>
<title>Time logger</title>

<style>
    h1 {
        text-align: center;
    }

    button {
        padding: 0.5em 1em;
        margin: 0 1em;
        font-weight: bold;
        font-size: 1.2em;
    }

    .dashboard {
        display: flex;
        flex-wrap: wrap;
    }

    .dashboard .project {
        width: 250px;
        background-color: #9999FF;
        margin: 1em;
        padding: 1em;
        border: 5px solid black;
        border-radius: 25px;
        box-shadow: 5px 5px 5px #999999;
    }

    .dashboard .project.active {
        border-color: #00FF00;
    }

    .dashboard .project .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        font-size: 2em;
        margin: 0;
    }

    .dashboard .project .logs {
        background-color: #FFFFFF;
        border: 3px solid black;
        height: 180px;
        overflow: auto;
        margin: 1em 0;
        padding: 2px 5px;
    }
    .dashboard .project .logs div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .dashboard .project .logs .time {
        font-weight: bold;
    }
    .dashboard .project .logs .date:before,
    .dashboard .project .logs .date:after {
        content: ' - ';
    }

    .dashboard .project .buttons {
        text-align: center;
    }

    #overlay {
        display: none;
        opacity: 0.5;
        background-color: #000000;
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        z-index: 1000;
    }

    #modal {
        display: none;
        position: fixed;
        background-color: #FFFFFF;
        padding: 1em;
        border: 5px solid black;
        border-radius: 25px;
        box-shadow: 5px 5px 5px #000000;
        z-index: 1001;

        /* Attempt to centre the window */
        top: 50%;
        left: 50%;
        margin-top: -100px;
        margin-left: -270px;
    }

    #modal .title {
        text-align: center;
        font-size: 2em;
        margin: 0;
    }

    #modal .field {
        font-size: 1.2em;
        padding: 0.5em;
    }
    #modal .field input {
        width: 400px;
    }

    #modal .buttons {
        text-align: center;
        margin: 1em 0;
    }
</style>


<script>
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
</script>
</head>

<body>

<?php
    $project = new Project();
    $project->setName("Test");
    $project->save();
?>

<button style="float: right">Check out</button>
<h1>Gael Lafond</h1>

<div class="dashboard">
    <div id="overlay"></div>
    <div id="modal">
        <h2 class="title">New activity</h2>
        <div class="field">Activity: <input type="text"></div>
        <div class="buttons">
            <button onclick="cancel()">Ok</button>
            <button onclick="cancel()">Cancel</button>
        </div>
    </div>

    <div class="project" style="background-color: #FFFF99">
        <h2 class="title">Lunch</h2>
        <div class="logs">
            <div><span class="time">01:00:00</span> - Lunch</div>
            <div><span class="date">30 Nov 2019</span></div>
            <div><span class="time">00:50:00</span> - Lunch</div>
            <div><span class="date">1 Dec 2019</span></div>
            <div><span class="time">01:10:00</span> - Lunch</div>
            <div><span class="date">2 Dec 2019</span></div>
            <div><span class="time">00:35:12</span> - Lunch</div>
            <div><span class="date">3 Dec 2019</span></div>
            <div><span class="time">01:01:01</span> - Lunch</div>
            <div><span class="date">4 Dec 2019</span></div>
            <div><span class="time">01:00:00</span> - Lunch</div>
        </div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project" style="background-color: #FF9999">
        <h2 class="title">Meetings</h2>
        <div class="logs">
            <div><span class="date">27 Nov 2019</span></div>
            <div><span class="time">01:15:00</span> - JCC</div>
            <div><span class="date">4 Dec 2019</span></div>
            <div><span class="time">02:10:00</span> - Team meeting</div>
        </div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project active">
        <h2 class="title">eReefs</h2>
        <div class="logs">
            <div><span class="date">1 Dec 2019</span></div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="date">2 Dec 2019</span></div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="date">3 Dec 2019</span></div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="date">4 Dec 2019</span></div>
            <div><span class="time">02:05:38</span> - Adjust video aspect ratio</div>
            <div><span class="time">01:25:03</span> - Fixing memory leak</div>
            <div><span class="date">5 Dec 2019</span></div>
            <div><span class="time" id="eReefsLog">00:00:00</span> - Fixing out of date calculations</div>
        </div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project">
        <h2 class="title">eAtlas</h2>
        <div class="logs">
            <div><span class="date">2 Dec 2019</span></div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="date">3 Dec 2019</span></div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="date">4 Dec 2019</span></div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">04:27:02</span> - Old stuff</div>
            <div><span class="time">02:05:38</span> - Adjust video aspect ratio</div>
            <div><span class="time">01:25:03</span> - Fixing memory leak</div>
        </div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project">
        <h2 class="title">GHHP</h2>
        <div class="logs"></div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project">
        <h2 class="title">Marine Site Planner</h2>
        <div class="logs"></div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project">
        <h2 class="title">...</h2>
        <div class="logs"></div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project">
        <h2 class="title">...</h2>
        <div class="logs"></div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>

    <div class="project">
        <h2 class="title">...</h2>
        <div class="logs"></div>
        <div class="buttons"><button onclick="start()">Start</button></div>
    </div>
<div>

<script>
    let startTime = new Date();
    let eReefsLog = document.getElementById("eReefsLog");
    window.setInterval(function() {
        let elapse = new Date() - startTime;
        eReefsLog.innerHTML = formatTime(elapse);
    }, 1000);

    let logDivs = document.getElementsByClassName("logs");
    for (let i=0; i<logDivs.length; i++) {
        logDivs[i].scrollTop = logDivs[i].scrollHeight;
    }
</script>
</body>

</html>
