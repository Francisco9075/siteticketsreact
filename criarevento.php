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

    $data = json_decode(file_get_contents("php://input"), true);

    $sql = "INSERT INTO EVENTOS (NOME, Descricao, Data_Inicio, Data_Fim, Imagem, Cartaz_do_evento, Localizacao, Data_publicacao)
            VALUES (:nome, :descricao, :dataInicio, :dataFim, :imagem,  :cartazEvento, :localizacao, :dataPublicacao)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
    ":nome" => $data["nome"] ?? '',
    ":descricao" => $data["descricao"] ?? '',
    ":dataInicio" => $data["dataInicio"] ?? null,
    ":dataFim" => $data["dataFim"] ?? null,
    ":imagem" => $data["imagem"] ?? '',
    ":cartazEvento" => $data["cartazEvento"] ?? '',
    ":localizacao" => $data["localizacao"] ?? '',
    ":dataPublicacao" => $data["dataPublicacao"] ?? null,
    ":termosAceites" => $data["termosAceites"] ? 1 : 0,
]);

    echo json_encode(["success" => true, "message" => "Evento criado com sucesso!"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro ao criar evento: " . $e->getMessage()]);
}
?>
