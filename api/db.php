<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $this->host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: "mysql-erucare.alwaysdata.net";
        $this->db_name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: "erucare_tracker";
        $this->username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: "erucare";
        $this->password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: "Mickeyandmouse152526.";
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
