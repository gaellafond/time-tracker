<?php
include_once 'PersistentObject.php';

class Project extends PersistentObject {
    private static $tableName = 'project';
    private $name;

    public function __construct($record = NULL) {
        parent::__construct();
        if ($record) {
            $this->id = $record['id'];
            $this->setName($record['name']);
        }
    }

    public function getTableName() {
        return self::$tableName;
    }

    static public function get($id) {
        $db = new Database();
        $table = self::$tableName;
        $stmt = $db->getPDO()->prepare("SELECT * FROM $table WHERE id = :id");
        $stmt->execute(array(
            ':id' => $id
        ));
        return new Project($stmt->fetch());
    }
    static public function getAll() {
        $db = new Database();
        $table = self::$tableName;
        $stmt = $db->getPDO()->prepare("SELECT * FROM $table ORDER BY id");
        $stmt->execute();

        $projects = array();
        while($row = $stmt->fetch()) {
            array_push($projects, new Project($row));
        }

        return $projects;
    }

    public function getName() {
        return $this->name;
    }
    public function setName($name) {
        $this->name = $name;
    }

    public function _createTable(PDO $pdo) {
        // sql to create table
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("CREATE TABLE $table (
                id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
                name VARCHAR(1000) NOT NULL
            )");
            $stmt->execute();

            // TODO So something nice here
            echo "Table project created successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
            echo $e->getMessage();
        }
    }

    protected function _insert(PDO $pdo) {
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("INSERT INTO $table (name) VALUES (:name)");
            $stmt->execute(array(
                ':name' => $this->name
            ));

            // TODO So something nice here
            echo "Project created successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
            echo $e->getMessage();
        }
    }
    protected function _update(PDO $pdo) {
        try {
            $table = self::$tableName;
            $stmt = $pdo->prepare("UPDATE $table SET name = :name WHERE id = :id");
            $stmt->execute(array(
                ':name' => $this->name,
                ':id' => $this->id
            ));

            // TODO So something nice here
            echo "Project updated successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
            echo $e->getMessage();
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
            echo "Project deleted successfully";
        } catch(PDOException $e) {
            // TODO So something nice here
            echo $e->getMessage();
        }
    }
}
?>
