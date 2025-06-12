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

    $nome = $conn->real_escape_string($data["nome"]);
    $tipo = $conn->real_escape_string($data["tipo"]);
    $precoLiquido = floatval($data["preco"]);
    $quantidade = intval($data["quantidade"]);
    $dataEvento = $conn->real_escape_string($data["data"]);
    $gratuito = intval($data["gratuito"]);

    // Se for gratuito, o valor final é 0
    $precoFinal = $gratuito ? 0 : round($precoLiquido * 1.06 + 1.23, 2); // IVA 6% + 1.23€

    $sql = "INSERT INTO BILHETES (NOME, Tipo, Preco, Quant_Disponivel, Data, Gratuito) 
            VALUES ('$nome', '$tipo', $precoFinal, $quantidade, '$dataEvento', $gratuito)";

    if ($conn->query($sql)) {
        echo json_encode(["sucesso" => true, "message" => "Bilhete criado com sucesso!"]);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao inserir: " . $conn->error]);
    }
}

$conn->close();
