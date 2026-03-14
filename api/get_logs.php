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
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

$query = "SELECT ml.taken_at, m.medicine_name 
          FROM medicine_logs ml 
          JOIN medicines m ON ml.medicine_id = m.id 
          WHERE ml.user_id = :user_id 
          ORDER BY ml.taken_at DESC 
          LIMIT :limit";

$stmt = $db->prepare($query);
$stmt->bindParam(":user_id", $user_id);
$stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
$stmt->execute();

$logs = array();

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $logs[] = [
        'medicine_name' => $row['medicine_name'],
        'date' => date('M d, Y', strtotime($row['taken_at'])),
        'time' => date('h:i A', strtotime($row['taken_at']))
    ];
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "logs" => $logs
]);
?>
