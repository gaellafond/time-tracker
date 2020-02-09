<?php
include_once 'Database.php';

/**
 * NOTE Sub classes of PersistentObject should
 *     implements the following methods, but
 *     they can not be defined here as abstract
 *     methods since they are statics:
 *         static public function get($db, $id)
 *         static public function getAll($db)
 */
abstract class PersistentObject {
    protected $db;
    protected $id;

    abstract public function getTableName();
    abstract protected function _createTable(PDO $pdo);
    abstract protected function _insert(PDO $pdo);
    abstract protected function _update(PDO $pdo);
    abstract protected function _delete(PDO $pdo);

    public function __construct() {
        $this->db = new Database();
    }

    public function tableExists(PDO $pdo) {
        // Try a select statement against the table
        // Run it in try/catch in case PDO is in ERRMODE_EXCEPTION.
        try {
            $table = $this->getTableName();
            $stmt = $pdo->prepare("SELECT 1 FROM $table LIMIT 1");
            $stmt->execute();
            $result = $stmt->fetch();
        } catch (Exception $e) {
            // We got an exception == table not found
            return FALSE;
        }

        // Result is either boolean FALSE (no table found) or PDOStatement Object (table found)
        return $result !== FALSE;
    }

    public function save() {
        $pdo = $this->db->getPDO();

        if (!$this->tableExists($pdo)) {
            $this->_createTable($pdo);
        }

        if ($this->id) {
            // Update
            $this->_update($pdo);
        } else {
            // Insert
            $this->_insert($pdo);
            $this->id = $pdo->lastInsertId();
        }
    }

    public function delete() {
        $pdo = $this->db->getPDO();

        if ($this->tableExists($pdo)) {
            $this->_delete($pdo);
        }
    }

    public function getId() {
        return $this->id;
    }
}
?>
