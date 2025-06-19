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

    if (!$data) {
        http_response_code(400);
        echo json_encode(["erro" => "Dados inválidos ou não enviados"]);
        exit();
    }

    $nome = isset($data["nome"]) ? $conn->real_escape_string($data["nome"]) : '';
    $descricao = isset($data["descricao"]) ? $conn->real_escape_string($data["descricao"]) : '';
    $dataInicio = isset($data["data_inicio"]) ? $conn->real_escape_string($data["data_inicio"]) : '';
    $dataFim = isset($data["data_fim"]) ? $conn->real_escape_string($data["data_fim"]) : '';
    $imagem = isset($data["imagem"]) ? $conn->real_escape_string($data["imagem"]) : '';
    $idEstadoEvento = isset($data["id_estado_evento"]) ? intval($data["id_estado_evento"]) : '';
    $idCategoria = isset($data["id_categoria"]) ? intval($data["id_categoria"]) : '';
    $cartaz = isset($data["cartaz_do_evento"]) ? $conn->real_escape_string($data["cartaz_do_evento"]) : '';
    $localizacao = isset($data["localizacao"]) ? $conn->real_escape_string($data["localizacao"]) : '';
    $dataPublicacao = isset($data["data_publicacao"]) ? $conn->real_escape_string($data["data_publicacao"]) : '';
    $linkUnico = isset($data["link_unico"]) ? $conn->real_escape_string($data["link_unico"]) : '';
    $termosAceites = isset($data["termos_aceites"]) ? intval($data["termos_aceites"]) : 0;

    $sql = "INSERT INTO EVENTOS (
                NOME, Descricao, Data_Inicio, Data_Fim, Imagem, 
                ID_Estado_Evento, ID_Categoria, Cartaz_do_evento, Localizacao,
                Data_publicacao, Link_unico, Termos_aceites
            ) VALUES (
                '$nome', '$descricao', '$dataInicio', '$dataFim', '$imagem',
                $idEstadoEvento, $idCategoria, '$cartaz', '$localizacao',
                '$dataPublicacao', '$linkUnico', $termosAceites
            )";

    if ($conn->query($sql)) {
        echo json_encode(["sucesso" => true, "message" => "Evento criado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao inserir: " . $conn->error]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                NOME, Descricao, Data_Inicio, Data_Fim, Imagem,
                ID_Estado_Evento, ID_Categoria, Cartaz_do_evento, Localizacao,
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
