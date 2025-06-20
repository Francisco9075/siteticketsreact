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

    // Calculate total tickets sold from Vendas_Detalhes (last 12 months)
    $query = "SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) as total_tickets 
              FROM Vendas_Detalhes vd 
              INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
              WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Last month tickets for comparison
    $lastMonthQuery = "SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) as last_month_tickets 
                       FROM Vendas_Detalhes vd 
                       INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                       WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) 
                       AND v.Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    $lastMonthStmt = $pdo->prepare($lastMonthQuery);
    $lastMonthStmt->execute();
    $lastMonthResult = $lastMonthStmt->fetch(PDO::FETCH_ASSOC);
    
    // Current month tickets
    $currentMonthQuery = "SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) as current_month_tickets 
                          FROM Vendas_Detalhes vd 
                          INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                          WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
    $currentMonthStmt = $pdo->prepare($currentMonthQuery);
    $currentMonthStmt->execute();
    $currentMonthResult = $currentMonthStmt->fetch(PDO::FETCH_ASSOC);
    
    $totalTickets = intval($result['total_tickets']);
    $currentMonthTickets = intval($currentMonthResult['current_month_tickets']);
    $lastMonthTickets = intval($lastMonthResult['last_month_tickets']);
    
    // Calculate percentage change
    $percentageChange = $lastMonthTickets > 0 ? (($currentMonthTickets - $lastMonthTickets) / $lastMonthTickets) * 100 : 0;
    
    echo json_encode([
        'successo' => true,
        'data' => [
            'total_tickets' => $totalTickets,
            'current_month_tickets' => $currentMonthTickets,
            'last_month_tickets' => $lastMonthTickets,
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