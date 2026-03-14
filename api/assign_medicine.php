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

if(!empty($data->user_id) && !empty($data->medicine_id) && !empty($data->quantity)) {
    $check_query = "SELECT id FROM user_medicines WHERE user_id = :user_id AND medicine_id = :medicine_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":user_id", $data->user_id);
    $check_stmt->bindParam(":medicine_id", $data->medicine_id);
    $check_stmt->execute();
    
    if($check_stmt->rowCount() > 0) {
        $query = "UPDATE user_medicines SET quantity = quantity + :quantity WHERE user_id = :user_id AND medicine_id = :medicine_id";
    } else {
        $query = "INSERT INTO user_medicines (user_id, medicine_id, quantity) VALUES (:user_id, :medicine_id, :quantity)";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $data->user_id);
    $stmt->bindParam(":medicine_id", $data->medicine_id);
    $stmt->bindParam(":quantity", $data->quantity);
    
    try {
        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Medicine assigned successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Failed to assign medicine"
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
        "message" => "User ID, Medicine ID, and Quantity are required"
    ]);
}
?>
