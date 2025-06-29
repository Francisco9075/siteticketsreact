<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

    $query = "
        SELECT 
            v.ID_Vendas as id,
            c.Nome as client_name,
            b.NOME as ticket_name,
            v.Valor_Total as price,
            IF(ck.ID_Checkin IS NULL, 0, 1) as checkin_status,
            ev.Nome as sale_status
        FROM 
            Vendas v
        JOIN 
            Clientes c ON v.ID_Clientes = c.ID_Clientes
        JOIN 
            Vendas_Detalhes vd ON v.ID_Vendas = vd.ID_Vendas
        JOIN 
            BILHETES b ON vd.ID_Bilhete = b.ID_Bilhetes
        LEFT JOIN 
            Checkin_Log ck ON vd.ID_Vendas_Detalhes = ck.ID_Vendas_Detalhes
        LEFT JOIN
            Estado_Vendas ev ON v.ID_Estado_Vendas = ev.ID_Estado_Vendas
        ORDER BY 
            v.Data DESC
        LIMIT 5
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatting data for frontend
    $formattedSales = array_map(function($sale) {
        return [
            'id' => $sale['id'],
            'client_name' => $sale['client_name'],
            'ticket_name' => $sale['ticket_name'],
            'price' => '€' . number_format($sale['price'], 2),
            'status' => $sale['checkin_status'] ? 'Confirmado' : 'Pendente',
            'sale_status' => $sale['sale_status']
        ];
    }, $sales);

    echo json_encode([
        'success' => true,
        'data' => $formattedSales,
        'tables_used' => [
            'vendas' => 'Vendas',
            'clientes' => 'Clientes',
            'vendas_detalhes' => 'Vendas_Detalhes',
            'bilhete' => 'BILHETES',
            'checkin' => 'Checkin_Log',
            'estado_vendas' => 'Estado_Vendas'
        ],
        'price_column_used' => 'Valor_Total'
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}