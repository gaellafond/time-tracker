<?php
// To connect to MariaDB:
//     sudo mariadb
// Create DB
//     CREATE DATABASE timetracker DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_unicode_ci;
//     GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, LOCK TABLES ON timetracker.* TO 'timetracker'@'localhost' IDENTIFIED BY 'b;FT_mEQW:u5d#26';

class Database {
    private $db;
    private $dbServer;
    private $dbUser;
    private $dbPass;

    public function __construct() {
        $this->db = 'timetracker';
        $this->dbServer = 'localhost';
        $this->dbUser = 'timetracker';
        $this->dbPass = 'b;FT_mEQW:u5d#26';
    }

    public function getPDO() {
        $pdo = new PDO('mysql:dbname='.$this->db.';host='.$this->dbServer.';charset=utf8', $this->dbUser, $this->dbPass);

        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $pdo;
    }
}
?>
