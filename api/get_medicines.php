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

$query = "SELECT id, medicine_name FROM medicines ORDER BY medicine_name";
$stmt = $db->query($query);

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
