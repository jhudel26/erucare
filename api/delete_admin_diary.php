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

if(!empty($data->entry_id)) {
    $query = "DELETE FROM diary_entries WHERE id = :entry_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":entry_id", $data->entry_id);
    
    try {
        if($stmt->execute()) {
            if($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "message" => "Diary entry deleted successfully"
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    "success" => false,
                    "message" => "Diary entry not found"
                ]);
            }
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Failed to delete diary entry"
            ]);
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $exception->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Entry ID is required"
    ]);
}
?>
