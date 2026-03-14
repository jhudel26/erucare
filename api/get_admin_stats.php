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

try {
    $total_users_query = "SELECT COUNT(*) as total FROM users";
    $total_medicines_query = "SELECT COUNT(*) as total FROM medicines";
    $assigned_medicines_query = "SELECT COUNT(*) as total FROM user_medicines WHERE quantity > 0";
    $recent_diaries_query = "SELECT de.entry_text, de.created_at, u.name 
                             FROM diary_entries de 
                             JOIN users u ON de.user_id = u.id 
                             ORDER BY de.created_at DESC 
                             LIMIT 5";
    
    $total_users_stmt = $db->query($total_users_query);
    $total_users = $total_users_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $total_medicines_stmt = $db->query($total_medicines_query);
    $total_medicines = $total_medicines_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $assigned_medicines_stmt = $db->query($assigned_medicines_query);
    $assigned_medicines = $assigned_medicines_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $recent_diaries_stmt = $db->query($recent_diaries_query);
    $recent_diaries = array();
    
    while($row = $recent_diaries_stmt->fetch(PDO::FETCH_ASSOC)) {
        $recent_diaries[] = [
            'entry_text' => $row['entry_text'],
            'created_at' => date('M d, Y h:i A', strtotime($row['created_at'])),
            'name' => $row['name']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "stats" => [
            "total_users" => $total_users,
            "total_medicines" => $total_medicines,
            "assigned_medicines" => $assigned_medicines,
            "recent_diaries" => $recent_diaries
        ]
    ]);
    
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $exception->getMessage()
    ]);
}
?>
