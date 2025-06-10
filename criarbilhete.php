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

    if (!$data) {
        http_response_code(400);
        echo json_encode(["erro" => "Dados inválidos ou não enviados"]);
        exit();
    }

    $tipo = $conn->real_escape_string($data["tipo"]);
    $preco = floatval($data["preco"]);
    $quantidade = intval($data["quantidade"]);
    $dataEvento = $conn->real_escape_string($data["data"]);
    $gratuito = intval($data["gratuito"]);

    // NOTA: Ajustado com base nas colunas da tabela BILHETES visíveis no HeidiSQL
    $sql = "INSERT INTO BILHETES (Tipo, Preco, Quant_Disponivel, Data, Gratuito) 
            VALUES ('$tipo', $preco, $quantidade, '$dataEvento', $gratuito)";

    if ($conn->query($sql)) {
        echo json_encode(["sucesso" => true, "message" => "Bilhete criado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao inserir: " . $conn->error]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM BILHETES ORDER BY ID_Bilhetes DESC"; // Corrigido o nome da coluna
    $result = $conn->query($sql);

    if ($result) {
        $bilhetes = [];
        while ($row = $result->fetch_assoc()) {
            $bilhetes[] = $row;
        }
        echo json_encode($bilhetes);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao buscar bilhetes: " . $conn->error]);
    }
}

$conn->close();
