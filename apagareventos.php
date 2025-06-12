<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "188.245.212.195";
$user = "makeitreal_tickets";
$password = "+4NH{5r910FQ";
$database = "makeitreal_tickets";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro de conexão: " . $conn->connect_error]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["id_evento"])) {
        http_response_code(400);
        echo json_encode(["erro" => "ID do evento não fornecido"]);
        exit();
    }

    $idEvento = intval($data["id_evento"]);

    $sql = "DELETE FROM EVENTOS WHERE ID_Evento = $idEvento";

    if ($conn->query($sql)) {
        if ($conn->affected_rows > 0) {
            echo json_encode(["sucesso" => true, "message" => "Evento apagado com sucesso!"]);
        } else {
            http_response_code(404);
            echo json_encode(["erro" => "Evento não encontrado"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao apagar evento: " . $conn->error]);
    }
}

$conn->close();
?>
