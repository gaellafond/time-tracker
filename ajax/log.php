<?php
include_once '../classes/Log.php';

// JSON headers
header('Content-type: application/json');
// Hide all errors / warnings, that doesn't go well with JSON
//error_reporting(0);

$json = new stdClass();
$error = null;

function getGetParameter($name) {
    return array_key_exists($name, $_GET) ? $_GET[$name] : NULL;
}
function getPostParameter($name) {
    return array_key_exists($name, $_POST) ? $_POST[$name] : NULL;
}

$action = getPostParameter("action");
if (!$action) {
    $error = "Missing parameter 'action'";
} else {
    $log = new Log();
    $log->setId(getPostParameter("id"));
    $log->setProjectId(getPostParameter("projectId"));
    $log->setMessage(getPostParameter("message"));
    $log->setStartDate(getPostParameter("startDate"));
    $log->setEndDate(getPostParameter("endDate"));

    switch ($action) {
        case 'insert':
        case 'update':
        case 'save':
            $log->save();
            break;

        case 'delete':
            $log->delete();
            break;

        default:
            $error = "Invalid parameter 'action={$action}'";
            break;
    }

    $json->id = $log->getId();
    $json->projectId = $log->getProjectId();
    $json->message = $log->getMessage();
    $json->startDate = $log->getStartDate();
    $json->endDate = $log->getEndDate();
}

if ($error) {
    $json->success = false;
    $json->error = $error;
    http_response_code(500);
}

echo json_encode($json);
?>
