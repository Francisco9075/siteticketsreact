<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
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

    // Verificar se é uma requisição POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
        exit();
    }

    // Capturar dados do POST
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
    $quant_total = isset($_POST['quant_total']) ? intval($_POST['quant_total']) : 0;
    $quant_vendida = isset($_POST['quant_vendida']) ? intval($_POST['quant_vendida']) : 0;
    $estado_id = isset($_POST['estado_id']) && is_numeric($_POST['estado_id']) ? intval($_POST['estado_id']) : 1;
    $desconto = isset($_POST['desconto']) && is_numeric($_POST['desconto']) ? intval($_POST['desconto']) : 0;

    // Validações básicas
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
        exit();
    }

    if (empty($nome)) {
        echo json_encode(['success' => false, 'message' => 'Nome é obrigatório']);
        exit();
    }

    // Verificar se o bilhete existe
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM BILHETES WHERE ID_Bilhetes = ?");
    $stmt->execute([$id]);
    
    if ($stmt->fetchColumn() == 0) {
        echo json_encode(['success' => false, 'message' => 'Bilhete não encontrado']);
        exit();
    }

    // Atualizar o bilhete (sem ID_Evento e ID_Estado_Bilhete)
    $sql = "UPDATE BILHETES SET 
                NOME = ?,
                Quant_Total = ?,
                Quant_Vendida = ?,
                ID_Estado_Bilhete = ?,
                Desconto = ?
            WHERE ID_Bilhetes = ?";

    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $nome,
        $quant_total,
        $quant_vendida,
        $estado_id,
        $desconto,
        $id
    ]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Bilhete atualizado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Nenhuma alteração foi feita']);
    }

} catch (PDOException $e) {
    error_log("Erro ao editar bilhete: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Erro geral ao editar bilhete: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
}
?>
