<?php
// Clean CORS headers (remove duplicates)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Dados do banco de dados
$host = '188.245.212.195';
$dbname = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

try {
    // Conectar com PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Receber dados JSON do POST
    $data = json_decode(file_get_contents('php://input'), true);

    $email = isset($data['email']) ? trim($data['email']) : '';
    $senha = isset($data['password']) ? trim($data['password']) : '';

    // Validar campos
    if (empty($email) || empty($senha)) {
        echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios.']);
        exit;
    }

    // Buscar usuário na tabela ADMIN (using correct column names)
    $stmt = $pdo->prepare("SELECT * FROM ADMIN WHERE Email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validar senha (using correct column name)
    if ($admin && $senha === $admin['Password']) {
        echo json_encode([
            'success' => true, 
            'message' => 'Login realizado com sucesso.',
            'user' => [
                'id' => $admin['ID_Admin'],
                'email' => $admin['Email'],
                'username' => $admin['Username'],
                'nome_produtora' => $admin['Nome_Produtora']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>