<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
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

    // Captura o ID da URL query string
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    // Debug: log do ID recebido
    error_log("ID recebido para exclusão: " . $id);

    if ($id > 0) {
        // Confirma que o nome da tabela e coluna estão corretos
        $stmt = $pdo->prepare("DELETE FROM BILHETES WHERE ID_Bilhetes = ?");
        $stmt->execute([$id]);
        $quant_vendida = $stmt->fetchColumn();

        // Confirma se algum registro foi realmente deletado
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true]);
        } elseif($quant_vendida > 0) {
            echo json_encode(['success' => false, 'message' => 'Não é possível excluir um bilhete com vendas registradas.']);
            exit();
        } else {
            echo json_encode(['success' => false, 'message' => 'Bilhete não encontrado.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'ID inválido.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>
