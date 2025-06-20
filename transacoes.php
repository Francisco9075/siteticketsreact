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

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['successo' => false, 'message' => 'Erro de conexão: ' . $conn->connect_error]);
    exit();
}

$sql = "SELECT 
    ID_Vendas,
    Data,
    Valor_Total,
    Taxas,
    Valor_Liquido,
    ID_Estado_Vendas,
    ID_Metodo_Pagamento,
    Clientes.Nome AS Clientes,
    Fatura
    FROM Vendas
    INNER JOIN Clientes ON Vendas.ID_Clientes = Clientes.ID_Clientes";

$result = $conn->query($sql);

if ($result) {
    $vendas = [];

    while ($row = $result->fetch_assoc()) {
        $vendas[] = $row;
    }

    // Debug para verificar a estrutura
    error_log("Vendas encontrados: " . count($vendas));
    if (count($vendas) > 0) {
        error_log("Primeiro evento: " . print_r($vendas[0], true));
    }

    echo json_encode(['successo' => true, 'vendas' => $vendas]);
} else {
    echo json_encode(['successo' => false, 'message' => 'Erro na consulta: ' . $conn->error]);
}

$conn->close();
?>
