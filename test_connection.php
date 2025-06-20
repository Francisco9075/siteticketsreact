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

    // Test basic connection
    $connectionTest = $pdo->query("SELECT 1 as test")->fetch();
    
    // Test table existence and get basic counts
    $tables = [];
    
    // Test Evento table
    try {
        $eventoQuery = "SELECT COUNT(*) as count FROM Evento";
        $eventoStmt = $pdo->prepare($eventoQuery);
        $eventoStmt->execute();
        $eventoResult = $eventoStmt->fetch(PDO::FETCH_ASSOC);
        $tables['Evento'] = [
            'exists' => true,
            'count' => intval($eventoResult['count'])
        ];
    } catch (PDOException $e) {
        $tables['Evento'] = [
            'exists' => false,
            'error' => $e->getMessage()
        ];
    }
    
    // Test Vendas table
    try {
        $vendasQuery = "SELECT COUNT(*) as count FROM Vendas";
        $vendasStmt = $pdo->prepare($vendasQuery);
        $vendasStmt->execute();
        $vendasResult = $vendasStmt->fetch(PDO::FETCH_ASSOC);
        $tables['Vendas'] = [
            'exists' => true,
            'count' => intval($vendasResult['count'])
        ];
    } catch (PDOException $e) {
        $tables['Vendas'] = [
            'exists' => false,
            'error' => $e->getMessage()
        ];
    }
    
    // Test Vendas_Detalhes table
    try {
        $vendasDetalhesQuery = "SELECT COUNT(*) as count FROM Vendas_Detalhes";
        $vendasDetalhesStmt = $pdo->prepare($vendasDetalhesQuery);
        $vendasDetalhesStmt->execute();
        $vendasDetalhesResult = $vendasDetalhesStmt->fetch(PDO::FETCH_ASSOC);
        $tables['Vendas_Detalhes'] = [
            'exists' => true,
            'count' => intval($vendasDetalhesResult['count'])
        ];
    } catch (PDOException $e) {
        $tables['Vendas_Detalhes'] = [
            'exists' => false,
            'error' => $e->getMessage()
        ];
    }
    
    // Get database info
    $dbInfoQuery = "SELECT DATABASE() as db_name, VERSION() as db_version, NOW() as current_time";
    $dbInfoStmt = $pdo->prepare($dbInfoQuery);
    $dbInfoStmt->execute();
    $dbInfo = $dbInfoStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'successo' => true,
        'message' => 'Database connection successful',
        'database_info' => $dbInfo,
        'tables' => $tables,
        'connection_test' => $connectionTest,
        'timestamp' => date('Y-m-d H:i:s')
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