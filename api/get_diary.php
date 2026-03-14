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
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

$query = "SELECT de.id, de.entry_text, de.created_at, u.name 
          FROM diary_entries de 
          JOIN users u ON de.user_id = u.id 
          WHERE de.user_id = :user_id 
          ORDER BY de.created_at DESC 
          LIMIT :limit";

$stmt = $db->prepare($query);
$stmt->bindParam(":user_id", $user_id);
$stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
$stmt->execute();

$entries = array();

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $entries[] = [
        'id' => $row['id'],
        'entry_text' => $row['entry_text'],
        'date' => date('M d, Y', strtotime($row['created_at'])),
        'time' => date('h:i A', strtotime($row['created_at'])),
        'name' => $row['name']
    ];
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "entries" => $entries
]);
?>
