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

// Handle GET request to fetch events
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT ID_Evento as id, NOME as nome FROM EVENTOS ";
    $result = $conn->query($sql);
    
    if ($result) {
        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }
        echo json_encode($events);
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao buscar eventos: " . $conn->error]);
    }
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);


    if (!$data) {
        http_response_code(400);
        echo json_encode(["erro" => "Dados inválidos ou não enviados"]);
        exit();
    }

    $eventoId = isset($data["evento_id"]) ? intval($data["evento_id"]) : null;
    $nome = $conn->real_escape_string($data["nome"]);
    $tipo = $conn->real_escape_string($data["tipo"]);
    $precoLiquido = floatval($data["preco"]);
    $quantidade = intval($data["quantidade"]);
    $gratuito = intval($data["gratuito"]);

    // Se for gratuito, o valor final é 0
    $precoFinal = $gratuito ? 0 : round($precoLiquido * 1.06 + 1.23, 2); // IVA 6% + 1.23€

    // Generate unique payment page URL
    $ticketSlug = strtolower(str_replace([' ', 'ã', 'á', 'à', 'â', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'], 
                                       ['-', 'a', 'a', 'a', 'a', 'e', 'e', 'i', 'o', 'o', 'o', 'u', 'c'], 
                                       $nome));
    $ticketSlug = preg_replace('/[^a-z0-9-]/', '', $ticketSlug);
    $ticketSlug = preg_replace('/-+/', '-', $ticketSlug);
    $ticketSlug = trim($ticketSlug, '-');
    
    // Add timestamp to ensure uniqueness
    $uniqueId = uniqid();
    $paymentPageUrl = "ticket-{$ticketSlug}-{$uniqueId}.html";

    $sql = "INSERT INTO BILHETES (ID_Evento, NOME, Tipo, Preco, Quant_Disponivel, Gratuito, payment_page_url) 
            VALUES ($eventoId, '$nome', '$tipo', $precoFinal, $quantidade, $gratuito, '$paymentPageUrl')";

    if ($conn->query($sql)) {
        $ticketId = $conn->insert_id;
        
        // Create the payment page file
        $paymentPageContent = generatePaymentPage($ticketId, $nome, $tipo, $precoFinal, $quantidade, $gratuito);
        
        // Save the payment page
        $filePath = "pages/" . $paymentPageUrl;
        
        // Create pages directory if it doesn't exist
        if (!is_dir("pages")) {
            mkdir("pages", 0755, true);
        }
        
        if (file_put_contents($filePath, $paymentPageContent)) {
            echo json_encode([
                "sucesso" => true, 
                "message" => "Bilhete criado com sucesso!",
                "ticket_id" => $ticketId,
                "payment_page_url" => $paymentPageUrl,
                "full_url" => "http://localhost/pages/" . $paymentPageUrl
            ]);
        } else {
            echo json_encode([
                "sucesso" => true, 
                "message" => "Bilhete criado mas erro ao gerar página de pagamento",
                "ticket_id" => $ticketId
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao inserir: " . $conn->error]);
    }
}

function generatePaymentPage($ticketId, $nome, $tipo, $preco, $quantidade, $gratuito) {
    // ... (mantenha o mesmo conteúdo da função generatePaymentPage que você já tem)
    // Esta função pode permanecer exatamente como estava
    // ...
}

$conn->close();
?>
