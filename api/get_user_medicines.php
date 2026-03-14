<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
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

$user_id = $_SESSION['user_id'];

$query = "SELECT um.id, um.quantity, m.medicine_name 
          FROM user_medicines um 
          JOIN medicines m ON um.medicine_id = m.id 
          WHERE um.user_id = :user_id AND um.quantity > 0 
          ORDER BY m.medicine_name";

$stmt = $db->prepare($query);
$stmt->bindParam(":user_id", $user_id);
$stmt->execute();

$medicines = array();

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $medicines[] = $row;
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "medicines" => $medicines
]);
?>
