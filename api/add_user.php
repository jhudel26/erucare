<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db.php';

session_start();
if(!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access denied"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->username) && !empty($data->password) && !empty($data->role)) {
    $query = "INSERT INTO users (name, username, password, role) VALUES (:name, :username, :password, :role)";
    $stmt = $db->prepare($query);
    
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
    
    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":username", $data->username);
    $stmt->bindParam(":password", $hashed_password);
    $stmt->bindParam(":role", $data->role);
    
    try {
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "User created successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Failed to create user"
            ]);
        }
    } catch(PDOException $exception) {
        if($exception->getCode() == 23000) {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "message" => "Username already exists"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Database error: " . $exception->getMessage()
            ]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);
}
?>
