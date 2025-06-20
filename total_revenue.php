<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '188.245.212.195';
$dbname = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Calculate total revenue from sales (last 12 months)
    $query = "SELECT COALESCE(SUM(Valor_Total), 0) as total_revenue FROM Vendas WHERE Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate last month's revenue for comparison
    $lastMonthQuery = "SELECT COALESCE(SUM(Valor_Total), 0) as last_month_revenue FROM Vendas 
                       WHERE Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) 
                       AND Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    $lastMonthStmt = $pdo->prepare($lastMonthQuery);
    $lastMonthStmt->execute();
    $lastMonthResult = $lastMonthStmt->fetch(PDO::FETCH_ASSOC);
    
    // Current month revenue
    $currentMonthQuery = "SELECT COALESCE(SUM(Valor_Total), 0) as current_month_revenue FROM Vendas 
                          WHERE Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    $currentMonthStmt = $pdo->prepare($currentMonthQuery);
    $currentMonthStmt->execute();
    $currentMonthResult = $currentMonthStmt->fetch(PDO::FETCH_ASSOC);
    
    $totalRevenue = floatval($result['total_revenue']);
    $currentMonthRevenue = floatval($currentMonthResult['current_month_revenue']);
    $lastMonthRevenue = floatval($lastMonthResult['last_month_revenue']);
    
    // Calculate percentage change
    $percentageChange = $lastMonthRevenue > 0 ? (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 : 0;
    
    echo json_encode([
        'successo' => true,
        'data' => [
            'total_revenue' => number_format($totalRevenue, 2, '.', ''),
            'current_month_revenue' => number_format($currentMonthRevenue, 2, '.', ''),
            'last_month_revenue' => number_format($lastMonthRevenue, 2, '.', ''),
            'percentage_change' => round($percentageChange, 2),
            'trend' => $percentageChange >= 0 ? 'up' : 'down'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'successo' => false,
        'message' => 'Erro no banco de dados: ' . $e->getMessage()
    ]);
}
?>