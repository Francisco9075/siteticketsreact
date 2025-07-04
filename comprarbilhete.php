<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Conexão com a base de dados
$host = '188.245.212.195';
$db = 'makeitreal_tickets';
$user = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $password, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro na ligação à base de dados.']);
    exit;
}

// Receber dados do pedido POST
$data = json_decode(file_get_contents('php://input'), true);

// Verificações básicas
error_log("Dados recebidos: " . json_encode($data));

if (!isset($data['ticket_id']) || !isset($data['cliente'])) {
    echo json_encode(['success' => false, 'message' => 'Dados em falta.']);
    exit;
}

$ticketId = $data['ticket_id'];
$cliente = $data['cliente'];

$nome = $cliente['nome'] ?? '';
$email = $cliente['email'] ?? '';
$contacto = $cliente['contacto'] ?? '';
$nif = $cliente['nif'] ?? '';
$morada = $cliente['morada'] ?? '';
$pedidoFatura = isset($cliente['pedido_fatura']) ? 1 : 0;

try {
    // Verifica se o cliente já existe (pelo email)
    $stmt = $pdo->prepare("SELECT ID_Clientes FROM Clientes WHERE Email = :email");
    $stmt->execute(['email' => $email]);
    $clienteExistente = $stmt->fetch();

    if ($clienteExistente) {
        $id_cliente = $clienteExistente['ID_Clientes'];
    } else {
        // Insere novo cliente
        $stmt = $pdo->prepare("INSERT INTO Clientes (Nome, Email, Contacto, NIF, Morada, Pedido_Fatura) 
                               VALUES (:nome, :email, :contacto, :nif, :morada, :pedido_fatura)");
        $stmt->execute([
            'nome' => $nome,
            'email' => $email,
            'contacto' => $contacto,
            'nif' => $nif,
            'morada' => $morada,
            'pedido_fatura' => $pedidoFatura
        ]);
        $id_cliente = $pdo->lastInsertId();
    }

    // Verifica disponibilidade
    $stmt = $pdo->prepare("SELECT Quant_Disponivel FROM BILHETES WHERE ID_Bilhetes = :id");
    $stmt->execute(['id' => $ticketId]);
    $bilhete = $stmt->fetch();

    if (!$bilhete || $bilhete['Quant_Disponivel'] <= 0) {
        echo json_encode(['success' => false, 'message' => 'Bilhete esgotado ou inválido.']);
        exit;
    }

    // Atualiza bilhete
    $stmt = $pdo->prepare("UPDATE BILHETES 
                           SET Quant_Disponivel = Quant_Disponivel - 1, 
                               Quant_Vendida = Quant_Vendida + 1 
                           WHERE ID_Bilhetes = :id AND Quant_Disponivel > 0");
    $stmt->execute(['id' => $ticketId]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar bilhete.']);
        exit;
    }

    // (Opcional) Regista a compra numa tabela própria
    
    $stmt = $pdo->prepare("INSERT INTO Compras (ID_Clientes, ID_Bilhetes, Quantidade, Data_Compra) 
                           VALUES (:id_cliente, :id_bilhete, 1, NOW())");
    $stmt->execute([
        'id_cliente' => $id_cliente,
        'id_bilhete' => $ticketId
    ]);

    echo json_encode(['success' => true, 'message' => 'Compra realizada com sucesso!']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro na base de dados.', 'error' => $e->getMessage()]);
}
?>
