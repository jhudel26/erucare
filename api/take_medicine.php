<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db.php';

session_start();
if(!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->user_medicine_id)) {
    $user_id = $_SESSION['user_id'];
    
    $db->beginTransaction();
    
    try {
        $check_query = "SELECT um.quantity, m.medicine_name 
                        FROM user_medicines um 
                        JOIN medicines m ON um.medicine_id = m.id 
                        WHERE um.id = :user_medicine_id AND um.user_id = :user_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":user_medicine_id", $data->user_medicine_id);
        $check_stmt->bindParam(":user_id", $user_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() == 0) {
            throw new Exception("Medicine not found");
        }
        
        $medicine_data = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if($medicine_data['quantity'] <= 0) {
            throw new Exception("No medicine remaining");
        }
        
        $update_query = "UPDATE user_medicines SET quantity = quantity - 1 WHERE id = :user_medicine_id AND user_id = :user_id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(":user_medicine_id", $data->user_medicine_id);
        $update_stmt->bindParam(":user_id", $user_id);
        $update_stmt->execute();
        
        $log_query = "INSERT INTO medicine_logs (user_id, medicine_id, taken_at) VALUES (:user_id, (SELECT medicine_id FROM user_medicines WHERE id = :user_medicine_id), NOW())";
        $log_stmt = $db->prepare($log_query);
        $log_stmt->bindParam(":user_id", $user_id);
        $log_stmt->bindParam(":user_medicine_id", $data->user_medicine_id);
        $log_stmt->execute();
        
        $diary_text = "Took " . $medicine_data['medicine_name'];
        $diary_query = "INSERT INTO diary_entries (user_id, entry_text, created_at) VALUES (:user_id, :entry_text, NOW())";
        $diary_stmt = $db->prepare($diary_query);
        $diary_stmt->bindParam(":user_id", $user_id);
        $diary_stmt->bindParam(":entry_text", $diary_text);
        $diary_stmt->execute();
        
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Medicine taken successfully",
            "diary_entry" => $diary_text
        ]);
        
    } catch(Exception $exception) {
        $db->rollback();
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => $exception->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "User medicine ID is required"
    ]);
}
?>
