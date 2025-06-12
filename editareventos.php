<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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

    if (!$data || !isset($data["id_evento"])) {
        http_response_code(400);
        echo json_encode(["erro" => "Dados inválidos ou ID do evento não enviado"]);
        exit();
    }

    $idEvento = intval($data["id_evento"]);
    $nome = $conn->real_escape_string($data["nome"]);
    $descricao = $conn->real_escape_string($data["descricao"]);
    $dataInicio = $conn->real_escape_string($data["data_inicio"]);
    $dataFim = $conn->real_escape_string($data["data_fim"]);
    $localizacao = $conn->real_escape_string($data["localizacao"]);
    $dataPublicacao = $conn->real_escape_string($data["data_publicacao"]);
    $linkUnico = $conn->real_escape_string($data["link_unico"]);
    $termosAceites = intval($data["termos_aceites"]);

    $sql = "UPDATE EVENTOS SET 
                NOME = '$nome',
                Descricao = '$descricao',
                Data_Inicio = '$dataInicio',
                Data_Fim = '$dataFim',
                Localizacao = '$localizacao',
                Data_publicacao = '$dataPublicacao',
                Link_unico = '$linkUnico',
                Termos_aceites = $termosAceites
            WHERE ID_Evento = $idEvento";

    if ($conn->query($sql)) {
        echo json_encode(["sucesso" => true, "message" => "Evento atualizado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro a atualizar o evento: " . $conn->error]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                ID_Evento, NOME, Descricao, Data_Inicio, Data_Fim, Localizacao,
                Data_publicacao, Link_unico, Termos_aceites
            FROM EVENTOS ORDER BY ID_Evento DESC";

    $result = $conn->query($sql);

    if ($result) {
        $eventos = [];
        while ($row = $result->fetch_assoc()) {
            $eventos[] = $row;
        }
        echo json_encode(["sucesso" => true, "eventos" => $eventos]);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao buscar eventos: " . $conn->error]);
    }
}

$conn->close();
?>
