<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = '188.245.212.195';
$dbname = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Ajusta os nomes dos campos para baterem com a interface do React
    $stmt = $pdo->prepare("SELECT 
        ID_Evento, 
        NOME AS Nome, 
        Descricao, 
        Localizacao AS Local, 
        Data_Inicio, 
        Data_Fim
    FROM EVENTOS");
    
    $stmt->execute();
    $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "eventos" => $eventos]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Erro na conexão: " . $e->getMessage()]);
}
?>
