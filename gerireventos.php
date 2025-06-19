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
        ID_Evento,
        NOME,
        Descricao,
        Data_Inicio,
        Data_Fim,
        Imagem,
        ID_Estado_Evento,
        ID_Categoria,
        Cartaz_do_evento,
        Localizacao,
        ID_Admin,
        Data_publicacao,
        Link_unico,
        Termos_aceites
        FROM EVENTOS";
    
    $stmt = $pdo->query($sql);
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debug para verificar a estrutura
    error_log("Eventos encontrados: " . count($eventos));
    if (count($eventos) > 0) {
        error_log("Primeiro evento: " . print_r($eventos[0], true));
    }

    echo json_encode(['successo' => true, 'eventos' => $eventos]);

} catch (PDOException $e) {
    echo json_encode(['successo' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>
