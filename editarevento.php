<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Conexão com base de dados
$host = '188.245.212.195';
$dbname = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Receber JSON do corpo da requisição
    $data = json_decode(file_get_contents("php://input"), true);

    // Validar dados
    if (
        empty($data['id']) ||
        empty($data['nome']) ||
        empty($data['descricao']) ||
        empty($data['data_inicio']) ||
        empty($data['data_fim']) ||
        empty($data['localizacao'])
    ) {
        throw new Exception("Campos obrigatórios ausentes.");
    }

    $id = $data['id'];
    $nome = $data['nome'];
    $descricao = $data['descricao'];
    $data_inicio = $data['data_inicio'];
    $data_fim = $data['data_fim'];
    $localizacao = $data['localizacao'];

    // Atualizar evento
    $stmt = $pdo->prepare("UPDATE EVENTOS SET Nome = ?, Descricao = ?, Data_Inicio = ?, Data_Fim = ?, Localizacao = ? WHERE ID_Evento = ?");
    $stmt->execute([$nome, $descricao, $data_inicio, $data_fim, $localizacao, $id]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
