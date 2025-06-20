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

    $sql = "SELECT 
        ID_Bilhetes,
        BILHETES.NOME,
        Tipo,
        Quant_Disponivel,
        Quant_Vendida,
        Preco,
        Data,
        Gratuito,
        EVENTOS.NOME AS ID_Evento,
        Estado_Bilhete.Nome AS ID_Estado_Bilhete
        FROM BILHETES
        INNER JOIN EVENTOS ON BILHETES.ID_Evento = EVENTOS.ID_Evento
        INNER JOIN Estado_Bilhete ON BILHETES.ID_Estado_Bilhete = Estado_Bilhete.ID_Estado_Bilhete";
    
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
