<!DOCTYPE html>
<?php
include_once 'classes/Project.php';
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Time logger</title>

    <script src="js/jquery_3-4-1/jquery-3.4.1.min.js"></script>

    <link rel="stylesheet" type="text/css" href="css/time-tracker.css" />
    <script src="js/time-tracker.js"></script>
</head>

<body>

<?php
    /*
    $project = new Project();
    $project->setName("Test");
    $project->save();
    */
?>

<button style="float: right">Check out</button>
<h1>Gael Lafond</h1>

<div class="dashboard">
    <div id="overlay"></div>
    <div id="modal">
        <h2 class="title">New activity</h2>
        <div class="field"><label for="activity">Activity:</label> <input type="text" id="activity" /></div>
        <div class="buttons">
            <button onclick="cancel()">Ok</button>
            <button onclick="cancel()">Cancel</button>
        </div>
    </div>

    <?php
    /*
    $lunch = new Project();
    $lunch->setName("Lunch");
    $lunch->setBackgroundColour("#FFFF99");
    $lunch->setOrder(1);
    $lunch->save();

    $lunchLog1 = new Log();
    $lunchLog1->setMessage("lunch");
    $lunchLog1->setStartDate(strtotime("2020-02-08 12:00:00"));
    $lunchLog1->setEndDate(strtotime("2020-02-08 13:00:00"));
    $lunch->addLog($lunchLog1);

    $lunchLog2 = new Log();
    $lunchLog2->setMessage("lunch");
    $lunchLog2->setStartDate(strtotime("2020-02-09 12:00:00"));
    $lunchLog2->setEndDate(strtotime("2020-02-09 13:00:00"));
    $lunch->addLog($lunchLog2);

    $lunchLog3 = new Log();
    $lunchLog3->setMessage("lunch");
    $lunchLog3->setStartDate(strtotime("2020-02-09 14:00:00"));
    $lunch->addLog($lunchLog3);

    $meetings = new Project();
    $meetings->setName("Meetings");
    $meetings->setBackgroundColour("#FF9999");
    $meetings->setOrder(2);
    $meetings->save();

    $eReefs = new Project();
    $eReefs->setName("eReefs");
    $eReefs->setBackgroundColour("#9999FF");
    $eReefs->setOrder(3);
    $eReefs->save();

    $eAtlas = new Project();
    $eAtlas->setName("eAtlas");
    $eAtlas->setBackgroundColour("#9999FF");
    $eAtlas->setOrder(4);
    $eAtlas->save();

    $ghhp = new Project();
    $ghhp->setName("GHHP");
    $ghhp->setBackgroundColour("#9999FF");
    $ghhp->setOrder(5);
    $ghhp->save();
    */

    $projects = Project::getAll();
    global $project;
    foreach ($projects as $project) {
        include "projectMarkup.php";
    }
    ?>

<!--
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
-->
<div>

<script>
/*
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
*/
</script>
</body>

</html>
