<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database configuration
$db_host = "188.245.212.195";
$db_name = "makeitreal_tickets";
$db_user = "makeitreal_tickets";
$db_pass = "+4NH{5r910FQ";

// Connect to database
try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required = ['ticket_type', 'quantity', 'price', 'customer_name', 'email', 'phone', 'payment_method'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode([
            "success" => false,
            "message" => "Campo obrigatório faltando: $field"
        ]);
        exit;
    }
}

try {
    // Begin transaction
    $conn->beginTransaction();

    // 1. Get or create client
    $client_id = getOrCreateClient($conn, $data);

    // 2. Create sale record
    $invoice_number = generateInvoiceNumber();
    $valor_total = $data['price'] * $data['quantity'];
    $taxes = $valor_total * 0.23; // 23% VAT
    $valor_liquido = $valor_total - $taxes;

    $stmt = $conn->prepare("
        INSERT INTO Vendas (
            Data, 
            Valor_Total, 
            Taxes, 
            Valor_Usução, 
            ID_Estado_Vendas, 
            ID_Metodo_Pagamento, 
            ID_Cientes, 
            Fatura
        ) VALUES (
            NOW(), 
            :valor_total, 
            :taxes, 
            :valor_liquido, 
            1, /* 1 = Completed */
            :payment_method_id, 
            :client_id, 
            :invoice_number
        )
    ");

    $payment_method_id = ($data['payment_method'] === 'mbway') ? 1 : 2; // 1=MBWay, 2=Card

    $stmt->execute([
        ':valor_total' => $valor_total,
        ':taxes' => $taxes,
        ':valor_liquido' => $valor_liquido,
        ':payment_method_id' => $payment_method_id,
        ':client_id' => $client_id,
        ':invoice_number' => $invoice_number
    ]);

    $sale_id = $conn->lastInsertId();

    // 3. Create sale details
    $ticket_id = getTicketId($data['ticket_type']);
    $stmt = $conn->prepare("
        INSERT INTO Vendas_Detalhes (
            ID_Vendas, 
            ID_Bilhete, 
            Quantidade, 
            Preco_Unitario
        ) VALUES (
            :sale_id, 
            :ticket_id, 
            :quantity, 
            :price
        )
    ");

    $stmt->execute([
        ':sale_id' => $sale_id,
        ':ticket_id' => $ticket_id,
        ':quantity' => $data['quantity'],
        ':price' => $data['price']
    ]);

    // Commit transaction
    $conn->commit();

    // Return success
    echo json_encode([
        "success" => true,
        "message" => "Venda registrada com sucesso",
        "sale_id" => $sale_id,
        "invoice_number" => $invoice_number
    ]);

} catch(PDOException $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false,
        "message" => "Erro no banco de dados: " . $e->getMessage()
    ]);
}

// Helper functions
function getOrCreateClient($conn, $data) {
    // Check if client exists
    $stmt = $conn->prepare("SELECT ID_Cientes FROM Clientes WHERE Email = :email");
    $stmt->execute([':email' => $data['email']]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($client) return $client['ID_Cientes'];

    // Create new client
    $stmt = $conn->prepare("
        INSERT INTO Clientes (
            Nome, 
            Email, 
            Telefone, 
            Data_Registo
        ) VALUES (
            :name, 
            :email, 
            :phone, 
            NOW()
        )
    ");

    $stmt->execute([
        ':name' => $data['customer_name'],
        ':email' => $data['email'],
        ':phone' => $data['phone']
    ]);

    return $conn->lastInsertId();
}

function getTicketId($ticket_type) {
    $map = [
        'Alfama' => 1,
        'Miradouro' => 2,
        'DUO' => 3
    ];
    return $map[$ticket_type] ?? 1;
}

function generateInvoiceNumber() {
    return 'FAC-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), 6));
}
?>