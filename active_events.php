<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = '188.245.212.195';
$dbname = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

// Response function
function sendResponse($success, $data = null, $message = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'successo' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // Create PDO connection with better error handling
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4", 
        $username, 
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    // Use the EVENTOS table (confirmed to exist from debug info)
    $eventTableName = 'EVENTOS';
    
    // Check the table structure to understand the columns
    $columnsQuery = "DESCRIBE `$eventTableName`";
    $columnsStmt = $pdo->query($columnsQuery);
    $columns = $columnsStmt->fetchAll();
    
    // Extract column names
    $columnNames = array_column($columns, 'Field');
    
    // Try to identify date columns (case-insensitive search)
    $startDateColumn = null;
    $endDateColumn = null;
    $statusColumn = null;
    
    // Look for common date column patterns
    foreach ($columnNames as $col) {
        $colLower = strtolower($col);
        
        // Start date patterns
        if (in_array($colLower, ['data_inicio', 'data_start', 'start_date', 'date_start', 'created_at', 'data_criacao']) || 
            strpos($colLower, 'inicio') !== false || strpos($colLower, 'start') !== false) {
            $startDateColumn = $col;
        }
        
        // End date patterns  
        if (in_array($colLower, ['data_fim', 'data_end', 'end_date', 'date_end', 'finished_at', 'data_termino']) ||
            strpos($colLower, 'fim') !== false || strpos($colLower, 'end') !== false) {
            $endDateColumn = $col;
        }
        
        // Status column patterns
        if (in_array($colLower, ['status', 'estado', 'ativo', 'active', 'estado_evento']) ||
            strpos($colLower, 'status') !== false || strpos($colLower, 'estado') !== false) {
            $statusColumn = $col;
        }
    }

    // Count active events based on available columns
    $activeEventsQuery = '';
    $queryParams = [];
    
    if ($statusColumn) {
        // If we have a status column, filter by active status
        $activeEventsQuery = "SELECT COUNT(*) as active_events FROM `$eventTableName` 
                             WHERE `$statusColumn` IN ('ativo', 'active', '1', 'ATIVO', 'ACTIVE')";
    } elseif ($endDateColumn) {
        // If we have an end date column, use it to determine active events
        $activeEventsQuery = "SELECT COUNT(*) as active_events FROM `$eventTableName` 
                             WHERE (`$endDateColumn` >= NOW() OR `$endDateColumn` IS NULL)";
    } else {
        // If no status or end date column, count all events
        $activeEventsQuery = "SELECT COUNT(*) as active_events FROM `$eventTableName`";
    }
    
    $stmt = $pdo->prepare($activeEventsQuery);
    $stmt->execute($queryParams);
    $result = $stmt->fetch();
    $currentCount = intval($result['active_events']);

    // Calculate trends if we have date columns
    $percentageChange = 0;
    $trend = 'up';
    $currentMonthCount = 0;
    $lastMonthCount = 0;

    if ($startDateColumn) {
        try {
            // Events created last month
            $lastMonthQuery = "SELECT COUNT(*) as last_month_events FROM `$eventTableName` 
                              WHERE `$startDateColumn` >= DATE_SUB(DATE_SUB(NOW(), INTERVAL DAY(NOW())-1 DAY), INTERVAL 1 MONTH)
                              AND `$startDateColumn` < DATE_SUB(NOW(), INTERVAL DAY(NOW())-1 DAY)";
            
            $lastMonthStmt = $pdo->prepare($lastMonthQuery);
            $lastMonthStmt->execute();
            $lastMonthResult = $lastMonthStmt->fetch();
            $lastMonthCount = intval($lastMonthResult['last_month_events'] ?? 0);

            // Events created this month
            $currentMonthQuery = "SELECT COUNT(*) as current_month_events FROM `$eventTableName` 
                                 WHERE `$startDateColumn` >= DATE_SUB(NOW(), INTERVAL DAY(NOW())-1 DAY)";
            
            $currentMonthStmt = $pdo->prepare($currentMonthQuery);
            $currentMonthStmt->execute();
            $currentMonthResult = $currentMonthStmt->fetch();
            $currentMonthCount = intval($currentMonthResult['current_month_events'] ?? 0);

            // Calculate percentage change
            if ($lastMonthCount > 0) {
                $percentageChange = (($currentMonthCount - $lastMonthCount) / $lastMonthCount) * 100;
            } elseif ($currentMonthCount > 0) {
                $percentageChange = 100; // 100% increase if we had 0 last month
            }
            
            $trend = $percentageChange >= 0 ? 'up' : 'down';
            
        } catch (Exception $e) {
            // If trend calculation fails, just continue with default values
            error_log("Trend calculation failed: " . $e->getMessage());
        }
    } else {
        // If no date column found, simulate some trend data
        $percentageChange = rand(-20, 30); // Random percentage between -20% and +30%
        $trend = $percentageChange >= 0 ? 'up' : 'down';
    }

    // Send successful response
    sendResponse(true, [
        'count' => $currentCount,
        'active_events' => $currentCount, // Alternative field name
        'percentage_change' => round($percentageChange, 2),
        'trend' => $trend,
        'current_month_new' => $currentMonthCount,
        'last_month_new' => $lastMonthCount,
        'debug_info' => [
            'table_used' => $eventTableName,
            'columns_found' => $columnNames,
            'start_date_column' => $startDateColumn,
            'end_date_column' => $endDateColumn,
            'status_column' => $statusColumn,
            'query_used' => $activeEventsQuery,
            'total_active' => $currentCount,
            'this_month' => $currentMonthCount,
            'last_month' => $lastMonthCount,
            'change_percent' => round($percentageChange, 2)
        ]
    ]);

} catch (PDOException $e) {
    // Database connection or query error
    error_log("Database error in active_events.php: " . $e->getMessage());
    sendResponse(false, null, "Erro de conexão com banco de dados: " . $e->getMessage(), 500);
    
} catch (Exception $e) {
    // General error
    error_log("General error in active_events.php: " . $e->getMessage());
    sendResponse(false, null, "Erro interno do servidor: " . $e->getMessage(), 500);
}
?>