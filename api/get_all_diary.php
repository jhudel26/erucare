<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
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

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

$query = "SELECT de.id, de.entry_text, de.created_at, u.name, u.username 
          FROM diary_entries de 
          JOIN users u ON de.user_id = u.id 
          ORDER BY de.created_at DESC 
          LIMIT :limit";

$stmt = $db->prepare($query);
$stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
$stmt->execute();

$entries = array();

while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $entries[] = [
        'id' => $row['id'],
        'entry_text' => $row['entry_text'],
        'created_at' => date('M d, Y h:i A', strtotime($row['created_at'])),
        'name' => $row['name'],
        'username' => $row['username']
    ];
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "entries" => $entries
]);
?>
