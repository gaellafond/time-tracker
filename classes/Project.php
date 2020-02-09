<?php
include_once 'PersistentObject.php';
include_once 'Log.php';

class Project extends PersistentObject {
    public static $tableName = 'project';
    private $name;
    private $bgColour;
    private $order;

    public function __construct($record = NULL) {
        parent::__construct();
        if ($record) {
            $this->id = $record['id'];
            $this->setName($record['name']);
            $this->setBackgroundColour($record['bgColour']);
            $this->setOrder($record['ord']);
        }
    }

    public function getTableName() {
        return self::$tableName;
    }

    public function _createTable(PDO $pdo) {
        // sql to create table
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("CREATE TABLE $table (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(1000) NOT NULL,
                bgColour VARCHAR(10),
                ord INT
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
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("INSERT INTO $table (name, bgColour, ord) VALUES (:name, :bgColour, :ord)");
            $stmt->execute(array(
                ':name' => $this->name,
                ':bgColour' => $this->bgColour,
                ':ord' => $this->order
            ));

            // TODO So something nice here
//            echo "Project created successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
//            echo $e->getMessage();
        }
    }
    protected function _update(PDO $pdo) {
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("UPDATE $table SET name = :name, bgColour = :bgColour, ord = :ord WHERE id = :id");
            $stmt->execute(array(
                ':name' => $this->name,
                ':bgColour' => $this->bgColour,
                ':ord' => $this->order,
                ':id' => $this->id
            ));

            // TODO So something nice here
//            echo "Project updated successfully";
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

            $logs = Log::_getAll($pdo, $this->id);
            foreach ($logs as $log) {
                $log->_delete($pdo);
            }

            // TODO So something nice here
//            echo "Project deleted successfully";
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
        return $record ? new Project($record) : NULL;
    }
    static public function getAll() {
        $db = new Database();
        $table = self::$tableName;
        $stmt = $db->getPDO()->prepare("SELECT * FROM $table ORDER BY ord, id");
        $stmt->execute();

        $projects = array();
        while($row = $stmt->fetch()) {
            if ($row) {
                array_push($projects, new Project($row));
            }
        }

        return $projects;
    }

    public function getName() {
        return $this->name;
    }
    public function setName($name) {
        $this->name = $name;
    }

    public function getBackgroundColour() {
        return $this->bgColour;
    }
    public function setBackgroundColour($bgColour) {
        $this->bgColour = $bgColour;
    }

    public function getOrder() {
        return $this->order;
    }
    public function setOrder($order) {
        $this->order = $order;
    }

    public function getLogs() {
        return Log::getAll($this->id);
    }

    public function addLog(Log $log) {
        $log->setProjectId($this->id);
        $log->save();
    }
}
?>
