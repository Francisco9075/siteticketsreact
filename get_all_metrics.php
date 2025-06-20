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

    // Get all metrics with a single complex query for better performance
    $metricsQuery = "
        SELECT 
            -- Active Events
            (SELECT COUNT(*) FROM Evento WHERE Data_Fim >= NOW() OR Data_Fim IS NULL) as active_events,
            
            -- New Events This Month
            (SELECT COUNT(*) FROM Evento 
             WHERE Data_Inicio >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
             AND (Data_Fim >= NOW() OR Data_Fim IS NULL)) as new_events_this_month,
            
            -- New Events Last Month
            (SELECT COUNT(*) FROM Evento 
             WHERE Data_Inicio >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
             AND Data_Inicio < DATE_SUB(NOW(), INTERVAL 1 MONTH)
             AND (Data_Fim >= DATE_SUB(NOW(), INTERVAL 1 MONTH) OR Data_Fim IS NULL)) as new_events_last_month,
            
            -- Total Revenue (12 months)
            (SELECT COALESCE(SUM(Valor_Total), 0) FROM Vendas 
             WHERE Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)) as total_revenue,
            
            -- Current Month Revenue
            (SELECT COALESCE(SUM(Valor_Total), 0) FROM Vendas 
             WHERE Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) as current_month_revenue,
            
            -- Last Month Revenue
            (SELECT COALESCE(SUM(Valor_Total), 0) FROM Vendas 
             WHERE Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) 
             AND Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)) as last_month_revenue,
            
            -- Total Tickets (12 months)
            (SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) 
             FROM Vendas_Detalhes vd 
             INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
             WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)) as total_tickets,
            
            -- Current Month Tickets
            (SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) 
             FROM Vendas_Detalhes vd 
             INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
             WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) as current_month_tickets,
            
            -- Last Month Tickets
            (SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) 
             FROM Vendas_Detalhes vd 
             INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
             WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) 
             AND v.Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)) as last_month_tickets
    ";
    
    $stmt = $pdo->prepare($metricsQuery);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate percentage changes
    $eventsPercentageChange = $result['new_events_last_month'] > 0 ? 
        (($result['new_events_this_month'] - $result['new_events_last_month']) / $result['new_events_last_month']) * 100 : 0;
    
    $revenuePercentageChange = $result['last_month_revenue'] > 0 ? 
        (($result['current_month_revenue'] - $result['last_month_revenue']) / $result['last_month_revenue']) * 100 : 0;
    
    $ticketsPercentageChange = $result['last_month_tickets'] > 0 ? 
        (($result['current_month_tickets'] - $result['last_month_tickets']) / $result['last_month_tickets']) * 100 : 0;
    
    echo json_encode([
        'successo' => true,
        'data' => [
            'active_events' => [
                'count' => intval($result['active_events']),
                'percentage_change' => round($eventsPercentageChange, 2),
                'trend' => $eventsPercentageChange >= 0 ? 'up' : 'down',
                'current_month' => intval($result['new_events_this_month']),
                'last_month' => intval($result['new_events_last_month'])
            ],
            'total_revenue' => [
                'amount' => number_format(floatval($result['total_revenue']), 2, '.', ''),
                'percentage_change' => round($revenuePercentageChange, 2),
                'trend' => $revenuePercentageChange >= 0 ? 'up' : 'down',
                'current_month' => number_format(floatval($result['current_month_revenue']), 2, '.', ''),
                'last_month' => number_format(floatval($result['last_month_revenue']), 2, '.', '')
            ],
            'tickets_sold' => [
                'count' => intval($result['total_tickets']),
                'percentage_change' => round($ticketsPercentageChange, 2),
                'trend' => $ticketsPercentageChange >= 0 ? 'up' : 'down',
                'current_month' => intval($result['current_month_tickets']),
                'last_month' => intval($result['last_month_tickets'])
            ]
        ],
        'timestamp' => date('Y-m-d H:i:s'),
        'query_time' => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'successo' => false,
        'message' => 'Erro no banco de dados: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>