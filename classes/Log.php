<?php
include_once 'PersistentObject.php';
include_once 'Project.php';

class Log extends PersistentObject {
    public static $tableName = 'log';
    private $projectId;
    private $message;
    private $startDate;
    private $endDate;

    public function __construct($record = NULL) {
        parent::__construct();
        if ($record) {
            $this->id = $record['id'];
            $this->setProjectId($record['projectId']);
            $this->setMessage($record['message']);
            $this->setStartDate($record['startDate']);
            $this->setEndDate($record['endDate']);
        }
    }

    public function getTableName() {
        return self::$tableName;
    }

    public function _createTable(PDO $pdo) {
        // sql to create table
        try {
            $table = self::$tableName;
            $projectTable = Project::$tableName;
            $stmt = $pdo->prepare("CREATE TABLE $table (
                id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                projectId INT(6) UNSIGNED,
                message VARCHAR(1000),
                startDate BIGINT,
                endDate BIGINT,
                FOREIGN KEY (projectId) REFERENCES $projectTable(id)
            )");
            $stmt->execute();

            // TODO So something nice here
//            echo "Table $table created successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
//            echo $e->getMessage();
        }
    }

    protected function _insert(PDO $pdo) {
        if (!$this->message) {
            // Get last log message or project name
            $lastLog = Log::_getLast($pdo, $this->projectId);
            if ($lastLog) {
                $this->message = $lastLog->message;
            } else {
                $project = Project::get($this->projectId);
                if ($project) {
                    $this->message = $project->getName();
                }
            }
        }

        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("INSERT INTO $table (projectId, message, startDate, endDate) VALUES (:projectId, :message, :startDate, :endDate)");
            $stmt->execute(array(
                ':projectId' => $this->projectId,
                ':message' => $this->message,
                ':startDate' => $this->startDate,
                ':endDate' => $this->endDate
            ));

            // TODO So something nice here
//            echo "Log created successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
//            echo $e->getMessage();
        }
    }
    protected function _update(PDO $pdo) {
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("UPDATE $table SET projectId = :projectId, message = :message, startDate = :startDate, endDate = :endDate WHERE id = :id");
            $stmt->execute(array(
                ':projectId' => $this->projectId,
                ':message' => $this->message,
                ':startDate' => $this->startDate,
                ':endDate' => $this->endDate,
                ':id' => $this->id
            ));

            // TODO So something nice here
//            echo "Log updated successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
//            echo $e->getMessage();
        }
    }
    protected function _delete(PDO $pdo) {
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("DELETE FROM $table WHERE id = :id");
            $stmt->execute(array(
                ':id' => $this->id
            ));

            // TODO So something nice here
//            echo "Log deleted successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
//            echo $e->getMessage();
        }
    }

    static public function get($id) {
        $db = new Database();
        $table = self::$tableName;
        $stmt = $db->getPDO()->prepare("SELECT * FROM $table WHERE id = :id");
        $stmt->execute(array(
            ':id' => $id
        ));
        $record = $stmt->fetch();
        return $record ? new Log($record) : NULL;
    }
    static public function getAll($projectId) {
        $db = new Database();
        return Log::_getAll($db->getPDO(), $projectId);
    }
    static public function _getAll(PDO $pdo, $projectId) {
        $table = self::$tableName;
        $stmt = $pdo->prepare("SELECT * FROM $table WHERE projectId = :projectId ORDER BY startDate");
        $stmt->execute(array(
            ':projectId' => $projectId
        ));

        $logs = array();
        while($row = $stmt->fetch()) {
            if ($row) {
                array_push($logs, new Log($row));
            }
        }

        return $logs;
    }
    static public function getLast($projectId) {
        $db = new Database();
        return Log::_getLast($db->getPDO(), $projectId);
    }
    static public function _getLast(PDO $pdo, $projectId) {
        $table = self::$tableName;
        $stmt = $pdo->prepare("SELECT * FROM $table WHERE projectId = :projectId ORDER BY startDate DESC LIMIT 1");
        $stmt->execute(array(
            ':projectId' => $projectId
        ));
        $record = $stmt->fetch();
        return $record ? new Log($record) : NULL;
    }

    public function getProjectId() {
        return $this->projectId;
    }
    public function setProjectId($projectId) {
        $this->projectId = $projectId;
    }

    public function getMessage() {
        return $this->message;
    }
    public function setMessage($message) {
        $this->message = $message;
    }

    public function getStartDate() {
        return $this->startDate;
    }
    public function setStartDate($startDate) {
        $this->startDate = $startDate;
    }

    public function getEndDate() {
        return $this->endDate;
    }
    public function setEndDate($endDate) {
        $this->endDate = $endDate;
    }

    public function getDateStr() {
        return date("Y-m-d", $this->startDate);
    }

    public function getDuration() {
        return ($this->endDate ?
            $this->endDate - $this->startDate :
            time() - $this->startDate);
    }

    public function getDurationStr() {
        $remain = $this->getDuration();
        $sec = $remain % 60;
        $remain /= 60;
        $min = $remain % 60;
        $remain /= 60;
        $hour = $remain;

        return sprintf("%d:%02d:%02d", $hour, $min, $sec);
    }
}
?>
