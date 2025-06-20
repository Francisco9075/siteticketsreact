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

    // CORREÇÃO: Removido o alias "as ID_Bilhete" para manter "ID_Bilhetes"
    $sql = "SELECT 
        ID_Bilhetes,
        NOME,
        Tipo,
        Quant_Disponivel,
        Quant_Vendida,
        Preco,
        Data,
        Gratuito,
        ID_Evento,
        ID_Estado_Bilhete
        FROM BILHETES";
    
    $stmt = $pdo->query($sql);
    $bilhetes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debug para verificar a estrutura
    error_log("Bilhetes encontrados: " . count($bilhetes));
    if (count($bilhetes) > 0) {
        error_log("Primeiro bilhete: " . print_r($bilhetes[0], true));
    }

    echo json_encode(['success' => true, 'bilhetes' => $bilhetes]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>