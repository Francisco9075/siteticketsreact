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

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["erro" => "Erro de conexão: " . $e->getMessage()]);
    exit();
}

$rawInput = file_get_contents("php://input");
$jsonData = json_decode($rawInput, true);
$action = $_GET['action'] ?? $jsonData['action'] ?? null;

function generatePaymentPage($ticketId, $nome, $tipo, $preco, $quantidade, $gratuito) {
    $precoFormatado = number_format($preco, 2, ', ', ' ');
    $tipoFormatado = ucfirst(str_replace('_', ' ', $tipo));

    return <<<HTML
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprar Bilhete: {$nome} </title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8f9fa;
                color: #333;
                line-height: 1.6;
                min-height: 100vh;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
                display: grid;
                grid-template-columns: 1fr 380px;
                gap: 60px;
            }

            .main-content {
                background: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            .sidebar {
                background: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                height: fit-content;
                position: sticky;
                top: 40px;
            }

            .page-title {
                font-size: 2em;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 8px;
            }

            .page-subtitle {
                color: #666;
                font-size: 1.1em;
                margin-bottom: 40px;
            }

            .ticket-section {
                margin-bottom: 40px;
            }

            .section-title {
                font-size: 1.4em;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .ticket-option {
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
                cursor: pointer;
                transition: all 0.2s ease;
                background: white;
            }

            .ticket-option.selected {
                border-color: #007bff;
                background: #f8f9ff;
            }

            .ticket-option:hover {
                border-color: #007bff;
            }

            .ticket-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 8px;
            }

            .ticket-radio {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                border: 2px solid #ddd;
                position: relative;
                cursor: pointer;
            }

            .ticket-option.selected .ticket-radio {
                border-color: #007bff;
            }

            .ticket-option.selected .ticket-radio::after {
                content: '';
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #007bff;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .ticket-name {
                font-size: 1.1em;
                font-weight: 600;
                color: #1a1a1a;
            }

            .ticket-price {
                font-size: 1.1em;
                font-weight: 600;
                color: #1a1a1a;
                margin-left: auto;
            }

            .ticket-details {
                color: #666;
                font-size: 0.9em;
                margin-left: 33px;
            }

            .form-section {
                margin-bottom: 40px;
            }

            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .form-group {
                margin-bottom: 25px;
            }

            .form-group.full-width {
                grid-column: 1 / -1;
            }

            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #1a1a1a;
                font-size: 0.95em;
            }

            .form-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-size: 1em;
                transition: border-color 0.2s ease;
                background: white;
            }

            .form-input:focus {
                outline: none;
                border-color: #007bff;
            }

            .quantity-section {
                margin-bottom: 30px;
            }

            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-top: 10px;
            }

            .quantity-btn {
                width: 36px;
                height: 36px;
                border: 2px solid #e9ecef;
                background: white;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2em;
                font-weight: 600;
                color: #666;
                transition: all 0.2s ease;
            }

            .quantity-btn:hover:not(:disabled) {
                border-color: #007bff;
                color: #007bff;
            }

            .quantity-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }

            .quantity-display {
                font-size: 1.1em;
                font-weight: 600;
                color: #1a1a1a;
                min-width: 30px;
                text-align: center;
            }

            .checkout-btn {
                width: 100%;
                background: #1a1a1a;
                color: white;
                border: none;
                padding: 16px;
                border-radius: 6px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .checkout-btn:hover:not(:disabled) {
                background: #333;
            }

            .checkout-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            .order-summary {
                margin-bottom: 30px;
            }

            .order-item {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .order-item-image {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 1.2em;
            }

            .order-item-details {
                flex: 1;
            }

            .order-item-name {
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 4px;
            }

            .order-item-info {
                color: #666;
                font-size: 0.9em;
            }

            .order-totals {
                border-top: 1px solid #e9ecef;
                padding-top: 20px;
            }

            .total-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
            }

            .total-line.final {
                font-weight: 600;
                font-size: 1.1em;
                color: #1a1a1a;
                border-top: 1px solid #e9ecef;
                padding-top: 12px;
                margin-top: 12px;
            }

            .success-message {
                background: #d4edda;
                color: #155724;
                padding: 16px;
                border-radius: 6px;
                margin-bottom: 20px;
                border: 1px solid #c3e6cb;
                display: none;
            }

            .info-text {
                color: #666;
                font-size: 0.9em;
                margin-top: 15px;
                line-height: 1.5;
            }

            .error-message {
                background: #f8d7da;
                color: #721c24;
                padding: 16px;
                border-radius: 6px;
                margin-bottom: 20px;
                border: 1px solid #f5c6cb;
                display: none;
            }

            @media (max-width: 768px) {
                .container {
                    grid-template-columns: 1fr;
                    gap: 30px;
                    padding: 20px;
                }
                
                .main-content, .sidebar {
                    padding: 30px 20px;
                }
                
                .form-grid {
                    grid-template-columns: 1fr;
                }
                
                .page-title {
                    font-size: 1.6em;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="main-content">
                <h1 class="page-title">{$nome} </h1>
                <p class="page-subtitle">Selecione as opções do seu bilhete</p>
                
                <div id="errorMessage" class="error-message"></div>
                
                <div class="ticket-section">
                    <h2 class="section-title">
                        🎫 Tickets List
                    </h2>
                    
                    <div class="ticket-option selected" id="ticketOption">
                        <div class="ticket-header">
                            <div class="ticket-radio"></div>
                            <div class="ticket-name">{$nome} </div>
                            <div class="ticket-price">{$precoFormatado} €</div>
                        </div>
                        <div class="ticket-details">
                            {$tipoFormatado} • Bilhete base • Limitado • Disponíveis: <span id="available">{$quantidade} </span>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h2 class="section-title">Informações Pessoais</h2>
                    
                    <form id="paymentForm">
                        <input type="hidden" id="ticketId" value="{$ticketId} ">
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label" for="name">Primeiro Nome</label>
                                <input type="text" id="name" class="form-input" required placeholder="Pedro">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="lastname">Último Nome</label>
                                <input type="text" id="lastname" class="form-input" required placeholder="Sousa">
                            </div>
                            
                            <div class="form-group full-width">
                                <label class="form-label" for="email">Email</label>
                                <input type="email" id="email" class="form-input" required placeholder="exemplo@gmail.com">
                            </div>
                        </div>
                        
                        <div class="quantity-section">
                            <label class="form-label">Quantidade</label>
                            <div class="quantity-controls">
                                <button type="button" class="quantity-btn" id="decreaseBtn">-</button>
                                <span class="quantity-display" id="quantityDisplay">1</span>
                                <button type="button" class="quantity-btn" id="increaseBtn">+</button>
                            </div>
                            <input type="hidden" id="quantity" value="1">
                        </div>
                    </form>
                </div>
                
                <div id="successMessage" class="success-message">
                    ✅ <?php echo $gratuito ? 'Reserva realizada com sucesso!' : 'Compra realizada com sucesso!'; ?>
                    Um email de confirmação foi enviado.
                </div>
            </div>
            
            <div class="sidebar">
                <h3 class="section-title">Order Summary</h3>
                
                <div class="order-summary">
                    <div class="order-item">
                        <div class="order-item-image">🎫</div>
                        <div class="order-item-details">
                            <div class="order-item-name">{$nome} </div>
                            <div class="order-item-info">{$tipoFormatado} - Limitada</div>
                            <div class="order-item-info">Quantity: <span id="orderQuantity">1</span></div>
                        </div>
                    </div>
                </div>
                
                <div class="order-totals">
                    <div class="total-line">
                        <span>Subtotal</span>
                        <span id="subtotal">{$precoFormatado} €</span>
                    </div>
                    <div class="total-line">
                        <span>Taxa de serviço</span>
                        <span>0,00€</span>
                    </div>
                    <div class="total-line">
                        <span>IVA (0%)</span>
                        <span>0,00€</span>
                    </div>
                    <div class="total-line final">
                        <span>Total</span>
                        <span id="total">{$precoFormatado} €</span>
                    </div>
                </div>
        <button type="button" class="checkout-btn" id="submitBtn">
        Finalizar Compra
    </button>

    <script>
    document.getElementById("submitBtn").addEventListener("click", function() {
        setTimeout(function() {
        window.location.href = "http://localhost:5173/thank-you";
        }, 2000);
    });
    </script>


                <p class="info-text">
                    Ao efetuar a compra, concorda com os nossos 
                    <a href="#" style="color: #007bff;">Termos de Serviço</a> e 
                    <a href="#" style="color: #007bff;">Política de Privacidade</a>.
                </p>
            </div>
        </div>

        <script>
            const quantityDisplay = document.getElementById('quantityDisplay');
            const quantityInput = document.getElementById('quantity');
            const orderQuantity = document.getElementById('orderQuantity');
            const decreaseBtn = document.getElementById('decreaseBtn');
            const increaseBtn = document.getElementById('increaseBtn');
            const subtotal = document.getElementById('subtotal');
            const total = document.getElementById('total');
            const maxQuantity = {$quantidade} ;
            const unitPrice = {$preco} ;
            const gratuito = <?php echo $gratuito ? 'true' : 'false'; ?>;
            
            let currentQuantity = 1;
            
            function formatPrice(price) {
                return price.toLocaleString('pt-PT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                } ).replace('.', ', ') + '€';
            }
            
            function updateQuantity(newQuantity) {
                currentQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
                quantityDisplay.textContent = currentQuantity;
                quantityInput.value = currentQuantity;
                orderQuantity.textContent = currentQuantity;
                
                const totalPrice = gratuito ? 0 : (unitPrice * currentQuantity);
                subtotal.textContent = formatPrice(totalPrice);
                total.textContent = formatPrice(totalPrice);
                
                decreaseBtn.disabled = currentQuantity <= 1;
                increaseBtn.disabled = currentQuantity >= maxQuantity;
            }
            
            function showError(message) {
                const errorDiv = document.getElementById('errorMessage');
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                } , 5000);
            }
            
            decreaseBtn.addEventListener('click', () => {
                updateQuantity(currentQuantity - 1);
            } );
            
            increaseBtn.addEventListener('click', () => {
                updateQuantity(currentQuantity + 1);
            } );
            
            // Initialize
            updateQuantity(1);

            document.getElementById('paymentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const ticketId = document.getElementById('ticketId').value;
                const firstName = document.getElementById('name').value.trim();
                const lastName = document.getElementById('lastname').value.trim();
                const email = document.getElementById('email').value.trim();
                
                if (!firstName || !lastName || !email) {
                    showError('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                const formData = {
                    name: firstName + ' ' + lastName,
                    email: email,
                    quantity: parseInt(document.getElementById('quantity').value),
                    ticketId: ticketId
                } ;

                const submitBtn = document.getElementById('submitBtn');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Processando...';

                try {
                    const response = await fetch('api.php?action=comprar_bilhete', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        } ,
                        body: JSON.stringify(formData)
                    } );

                    if (!response.ok) {
                        throw new Error('Erro na resposta do servidor');
                    }

                    const result = await response.json();
                    
                    console.log('Resposta da API:', result);

                    if (result && result.success === true) {
                        // Mostrar mensagem de sucesso
                        document.getElementById('successMessage').style.display = 'block';
                        
                        // Atualizar quantidade disponível
                        const availableElement = document.getElementById('available');
                        if (result.available !== undefined) {
                            availableElement.textContent = result.available;
                        }
                        
                        // Redirecionar após 2 segundos
            document.getElementById('submitBtn').addEventListener('click', function() {
        window.location.href = 'http://localhost:5173/';
    });
        </script>
    </body>
    </html>
    HTML;
}

function obterOuCriarCliente($email, $nome, $pdo) {
    // Verifica se o cliente já existe
    $stmt = $pdo->prepare("SELECT ID_Cliente FROM CLIENTES WHERE Email = ?");
    $stmt->execute([$email]);
    $cliente = $stmt->fetch();

    if ($cliente) {
        return $cliente['ID_Cliente'];
    } else {
        // Cria novo cliente
        $stmt = $pdo->prepare("INSERT INTO CLIENTES (Nome, Email, Data_Cadastro) VALUES (?, ?, NOW())");
        $stmt->execute([$nome, $email]);
        return $pdo->lastInsertId();
    }
}

switch ($action) {
    case 'process_payment':    
        header('Content-Type: application/json');
        
        // Verifica se o método da requisição é POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
            exit();
        }

        // Obtém os dados do corpo da requisição
        $data = json_decode(file_get_contents("php://input"), true);

        // Validação básica dos dados
        if (empty($data['email']) || empty($data['quantity']) || empty($data['ticketId'])) {
            echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
            exit();
        }

        try {
            $pdo->beginTransaction();

            // 1. Verificar disponibilidade do bilhete
            $stmt = $pdo->prepare("
                SELECT Preco, Quant_Total, Quant_Vendida, Nome 
                FROM BILHETES 
                WHERE ID_Bilhetes = ? FOR UPDATE
            ");
            $stmt->execute([$data['ticketId']]);
            $bilhete = $stmt->fetch();

            if (!$bilhete) {
                throw new Exception('Bilhete não encontrado');
            }

            $disponivel = $bilhete['Quant_Total'] - $bilhete['Quant_Vendida'];
            if ($data['quantity'] > $disponivel) {
                throw new Exception('Quantidade indisponível');
            }

            // 2. Registrar/obter cliente
            $clienteId = obterOuCriarCliente($data['email'], $data['name'] ?? 'Cliente', $pdo);
            if (!$clienteId) {
                throw new Exception('Erro ao processar dados do cliente');
            }

            // 3. Calcular valores
            $precoUnitario = $bilhete['Preco'];
            $valorTotal = $precoUnitario * $data['quantity'];
            $taxas = $valorTotal * 0.06; // IVA 6%

            // 4. Registrar venda principal
            $vendaId = null;
            $stmt = $pdo->prepare("
                INSERT INTO Vendas 
                (Data_Venda, Valor_Total, ID_Metodo_Pagamento, ID_Clientes, Status) 
                VALUES (NOW(), ?, ?, ?, 'confirmado')
            ");
            $stmt->execute([
                $valorTotal,
                $data['paymentMethod'] ?? 1,
                $clienteId
            ]);
            $vendaId = $pdo->lastInsertId();

            // 5. Registrar detalhes da venda
            $stmt = $pdo->prepare("
                INSERT INTO Vendas_Detalhes 
                (ID_Vendas, ID_Bilhete, ID_Clientes, Quant_Bilhetes, Preco_Unitario, Data_Venda) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $vendaId,
                $data['ticketId'],
                $clienteId,
                $data['quantity'],
                $precoUnitario
            ]);

            // 6. Atualizar estoque do bilhete
            $stmt = $pdo->prepare("
                UPDATE BILHETES 
                SET Quant_Vendida = Quant_Vendida + ? 
                WHERE ID_Bilhetes = ?
            ");
            $stmt->execute([$data['quantity'], $data['ticketId']]);

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'vendaId' => $vendaId,
                'clienteId' => $clienteId,
                'available' => $disponivel - $data['quantity']
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Erro no process_payment: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;
        break;

    //section bilhetes
    case 'criar_bilhete':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $sql = "SELECT ID_Evento as id, NOME as nome FROM EVENTOS";
            $stmt = $pdo->prepare($sql);
            
            if ($stmt->execute()) {
                $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($events);
            } else {
                http_response_code(500);
                echo json_encode(["erro" => "Erro ao buscar eventos"]);
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
            $nome = $data["nome"];
            $tipo = $data["tipo"];
            $precoLiquido = floatval($data["preco"]);
            $quantidade = intval($data["quantidade"]);
            $gratuito = intval($data["gratuito"]);

            $precoFinal = $gratuito ? 0 : round($precoLiquido * 1.06 + 1.23, 2); // IVA 6% + 1.23€

            $ticketSlug = strtolower(str_replace([' ', 'ã', 'á', 'à', 'â', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'], 
                                            ['-', 'a', 'a', 'a', 'a', 'e', 'e', 'i', 'o', 'o', 'o', 'u', 'c'], 
                                            $nome));
            $ticketSlug = preg_replace('/[^a-z0-9-]/', '', $ticketSlug);
            $ticketSlug = preg_replace('/-+/', '-', $ticketSlug);
            $ticketSlug = trim($ticketSlug, '-');

            $uniqueId = uniqid();
            $paymentPageUrl = "ticket-{$ticketSlug}-{$uniqueId}.html";

            $sql = "INSERT INTO BILHETES (ID_Evento, NOME, Tipo, Preco, Quant_Total, Gratuito, payment_page_url) 
                    VALUES (:eventoId, :nome, :tipo, :preco, :quantidade, :gratuito, :paymentPageUrl)";
            
            try {
                $stmt = $pdo->prepare($sql);

                $success = $stmt->execute([
                    ':eventoId' => $eventoId,
                    ':nome' => $nome,
                    ':tipo' => $tipo,
                    ':preco' => $precoFinal,
                    ':quantidade' => $quantidade,
                    ':gratuito' => $gratuito,
                    ':paymentPageUrl' => $paymentPageUrl
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["erro" => "Erro ao inserir: " . $e->getMessage()]);
            }

            if ($success) {
                $ticketId = $pdo->lastInsertId();

                $paymentPageContent = generatePaymentPage($ticketId, $nome, $tipo, $precoFinal, $quantidade, $gratuito);
                $filePath = "pages/" . $paymentPageUrl;

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
                echo json_encode(["erro" => "Erro ao inserir"]);
            }
        }

        break;
    
    case 'comprar_bilhete':
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
            exit();
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // Validações mais robustas
        if (!$data || !is_array($data)) {
            echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
            exit();
        }

        $requiredFields = ['name', 'email', 'quantity', 'ticketId'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios']);
                exit();
            }
        }

        // Validar email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Email inválido']);
            exit();
        }

        // Validar quantidade
        if (!is_numeric($data['quantity']) || $data['quantity'] <= 0) {
            echo json_encode(['success' => false, 'message' => 'Quantidade inválida']);
            exit();
        }

        try {
            $pdo->beginTransaction();

            // 1. Verificar se o bilhete existe e obter informações
            $stmt = $pdo->prepare("
                SELECT ID_Bilhetes, Preco, Quant_Total, Quant_Vendida, Nome 
                FROM BILHETES 
                WHERE ID_Bilhetes = ? FOR UPDATE
            ");
            $stmt->execute([$data['ticketId']]);
            $bilhete = $stmt->fetch();

            if (!$bilhete) {
                throw new Exception("Bilhete não encontrado");
            }

            // 2. Verificar disponibilidade
            $disponivel = $bilhete['Quant_Total'] - $bilhete['Quant_Vendida'];
            if ($data['quantity'] > $disponivel) {
                throw new Exception("Quantidade solicitada não disponível. Disponível: " . $disponivel);
            }

            // 3. Obter ou criar cliente
            $clienteId = obterOuCriarCliente($data['email'], $data['name'], $pdo);
            if (!$clienteId) {
                throw new Exception("Erro ao processar dados do cliente");
            }

            // 4. Calcular valores
            $precoUnitario = $bilhete['Preco'];
            $valorTotal = $precoUnitario * $data['quantity'];

            // 5. Criar registro de venda principal (se tiver tabela Vendas)
            $vendaId = null;
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO Vendas (Data_Venda, Valor_Total, ID_Clientes, Status) 
                    VALUES (NOW(), ?, ?, 'confirmado')
                ");
                $stmt->execute([$valorTotal, $clienteId]);
                $vendaId = $pdo->lastInsertId();
            } catch (Exception $e) {
                // Se não tiver tabela Vendas, continua sem ela
                error_log("Tabela Vendas não encontrada ou erro: " . $e->getMessage());
            }

            // 6. Registrar detalhes da venda
            $stmt = $pdo->prepare("
                INSERT INTO Vendas_Detalhes 
                (ID_Vendas, ID_Bilhete, ID_Clientes, Quant_Bilhetes, Preco_Unitario, Data_Venda) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$vendaId, $data['ticketId'], $clienteId, $data['quantity'], $precoUnitario]);

            // 7. Atualizar quantidade vendida do bilhete
            $stmt = $pdo->prepare("
                UPDATE BILHETES 
                SET Quant_Vendida = Quant_Vendida + ? 
                WHERE ID_Bilhetes = ?
            ");
            $stmt->execute([$data['quantity'], $data['ticketId']]);

            // 8. Verificar se a atualização foi bem-sucedida
            if ($stmt->rowCount() === 0) {
                throw new Exception("Erro ao atualizar estoque do bilhete");
            }

            $pdo->commit();
            
            echo json_encode([
                'success'   => true,
                'message'   => 'Compra registrada com sucesso',
                'available' => $disponivel - $data['quantity'],
                'vendaId'   => $vendaId,
                'clienteId' => $clienteId
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Erro na compra: " . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
        break;

    case 'gerir_bilhetes':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $sql = "SELECT
                ID_Bilhetes,
                BILHETES.NOME,
                Tipo,
                Quant_Total,
                Quant_Vendida,
                Preco,
                Gratuito,
                payment_page_url,
                EVENTOS.NOME AS Evento_Nome,
                Estado_Bilhete.Nome AS Estado_Nome
            FROM BILHETES
            LEFT JOIN EVENTOS ON BILHETES.ID_Evento = EVENTOS.ID_Evento
            LEFT JOIN Estado_Bilhete ON BILHETES.ID_Estado_Bilhete = Estado_Bilhete.ID_Estado_Bilhete
            ORDER BY ID_Bilhetes DESC";

            $stmt = $pdo->query($sql);
            $bilhetes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'bilhetes' => $bilhetes]);
        }
        break;

    case 'editar_bilhete':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
            exit();
        }

        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $nome = $_POST['nome'] ?? '';
        $quant_total = intval($_POST['quant_total'] ?? 0);
        $quant_vendida = intval($_POST['quant_vendida'] ?? 0);
        $estado_id = intval($_POST['estado_id'] ?? 1);
        $desconto = intval($_POST['desconto'] ?? 0);

        if ($id <= 0 || empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM BILHETES WHERE ID_Bilhetes = ?");
        $stmt->execute([$id]);
        if ($stmt->fetchColumn() == 0) {
            echo json_encode(['success' => false, 'message' => 'Bilhete não encontrado']);
            exit();
        }

        $sql = "UPDATE BILHETES SET 
                    NOME = ?, 
                    Quant_Total = ?, 
                    Quant_Vendida = ?, 
                    ID_Estado_Bilhete = ?, 
                    Desconto = ? 
                WHERE ID_Bilhetes = ?";

        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([
            $nome, $quant_total, $quant_vendida, $estado_id, $desconto, $id
        ]);

        echo json_encode([
            'success' => $result, 
            'message' => $result ? 'Bilhete atualizado com sucesso' : 'Nenhuma alteração foi feita'
        ]);
        break;

    case 'apagar_bilhete':
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
        // Debug: log do ID recebido
        error_log("ID recebido para exclusão: " . $id);
    
        if ($id > 0) {
            // Confirma que o nome da tabela e coluna estão corretos
            try{
                $stmt = $pdo->prepare("DELETE FROM BILHETES WHERE ID_Bilhetes = ?");
                $stmt->execute([$id]);
                $quant_vendida = $stmt->fetchColumn();
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
            }
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
        break;

    //section eventos
    case 'criar_evento':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                http_response_code(400);
                echo json_encode(["erro" => "Dados inválidos ou não enviados"]);
                break;
            }

            $sql = "INSERT INTO EVENTOS (
                        NOME, Descricao, Data_Inicio, Data_Fim, Imagem,
                        ID_Estado_Evento, ID_Categoria, Cartaz_do_evento, Localizacao,
                        Data_publicacao, Link_unico, Termos_aceites
                    ) VALUES (
                        :nome, :descricao, :data_inicio, :data_fim, :imagem,
                        :id_estado_evento, :id_categoria, :cartaz_do_evento, :localizacao,
                        :data_publicacao, :link_unico, :termos_aceites
                    )";

            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([
                ':nome' => $data["nome"] ?? '',
                ':descricao' => $data["descricao"] ?? '',
                ':data_inicio' => $data["data_inicio"] ?? '',
                ':data_fim' => $data["data_fim"] ?? '',
                ':imagem' => $data["imagem"] ?? '',
                ':id_estado_evento' => intval($data["id_estado_evento"] ?? 0),
                ':id_categoria' => intval($data["id_categoria"] ?? 0),
                ':cartaz_do_evento' => $data["cartaz_do_evento"] ?? '',
                ':localizacao' => $data["localizacao"] ?? '',
                ':data_publicacao' => $data["data_publicacao"] ?? '',
                ':link_unico' => $data["link_unico"] ?? '',
                ':termos_aceites' => intval($data["termos_aceites"] ?? 0),
            ]);

            if ($success) {
                echo json_encode(["sucesso" => true, "message" => "Evento criado com sucesso!"]);
            } else {
                http_response_code(500);
                echo json_encode(["erro" => "Erro ao inserir evento"]);
            }
        }
        break;

    case 'gerir_eventos':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $sql = "SELECT 
                ID_Evento, NOME, Descricao, Data_Inicio, Data_Fim, Imagem,
                ID_Estado_Evento, ID_Categoria, Cartaz_do_evento, Localizacao,
                ID_Admin, Data_publicacao, Link_unico, Termos_aceites
                FROM EVENTOS";

            try {
                $stmt = $pdo->query($sql);
                $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(["sucesso" => true, "eventos" => $eventos]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["erro" => "Erro ao buscar eventos: " . $e->getMessage()]);
            }
        }
        break;

    case 'editar_evento':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data || !isset($data["id_evento"])) {
                http_response_code(400);
                echo json_encode(["erro" => "Dados inválidos ou ID do evento não enviado"]);
                break;
            }

            $sql = "UPDATE EVENTOS SET 
                        NOME = :nome,
                        Descricao = :descricao,
                        Data_Inicio = :data_inicio,
                        Data_Fim = :data_fim,
                        Imagem = :imagem,
                        ID_Estado_Evento = :id_estado_evento,
                        ID_Categoria = :id_categoria,
                        Cartaz_do_evento = :cartaz_do_evento,
                        Localizacao = :localizacao,
                        Data_publicacao = :data_publicacao,
                        Link_unico = :link_unico,
                        Termos_aceites = :termos_aceites
                    WHERE ID_Evento = :id_evento";

            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([
                ':nome' => $data["nome"] ?? '',
                ':descricao' => $data["descricao"] ?? '',
                ':data_inicio' => $data["data_inicio"] ?? '',
                ':data_fim' => $data["data_fim"] ?? '',
                ':imagem' => $data["imagem"] ?? '',
                ':id_estado_evento' => intval($data["id_estado_evento"] ?? 0),
                ':id_categoria' => intval($data["id_categoria"] ?? 0),
                ':cartaz_do_evento' => $data["cartaz_do_evento"] ?? '',
                ':localizacao' => $data["localizacao"] ?? '',
                ':data_publicacao' => $data["data_publicacao"] ?? '',
                ':link_unico' => $data["link_unico"] ?? '',
                ':termos_aceites' => intval($data["termos_aceites"] ?? 0),
                ':id_evento' => intval($data["id_evento"])
            ]);

            if ($success) {
                echo json_encode(["sucesso" => true, "message" => "Evento atualizado com sucesso!"]);
            } else {
                http_response_code(500);
                echo json_encode(["erro" => "Erro ao atualizar evento"]);
            }
        }
        break;

    case 'apagar_evento':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);

            if (!isset($data["id_evento"])) {
                http_response_code(400);
                echo json_encode(["erro" => "ID do evento não fornecido"]);
                break;
            }

            $sql = "DELETE FROM EVENTOS WHERE ID_Evento = :id_evento";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':id_evento', intval($data["id_evento"]));

            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    echo json_encode(["sucesso" => true, "message" => "Evento apagado com sucesso!"]);
                } else {
                    http_response_code(404);
                    echo json_encode(["erro" => "Evento não encontrado"]);
                }
            } else {
                http_response_code(500);
                echo json_encode(["erro" => "Erro ao apagar evento"]);
            }
        }
        break;

    //section clientes

    //Sign In
    case 'signin':
        $data = json_decode(file_get_contents('php://input'), true);

        $email = isset($data['email']) ? trim($data['email']) : '';
        $senha = isset($data['password']) ? trim($data['password']) : '';

        if (empty($email) || empty($senha)) {
            echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios.']);
            exit;
        }

        // Buscar usuário na tabela ADMIN (using correct column names)
        try {
            $stmt = $pdo->prepare("SELECT * FROM ADMIN WHERE Email = ?");
            $stmt->execute([$email]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["erro" => "Erro ao fazer login: " . $e->getMessage()]);
        }

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
        break;
    

    //IBAN
    case 'get_IBAN':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $iban = $_POST['iban'] ?? '';
            $idAdmin = $_POST['id_admin'] ?? '';

            if (!$iban || !$idAdmin) {
                http_response_code(400);
                echo json_encode(["erro" => "Dados incompletos ou inválidos."]);
                break;
            }

            // Atualizar registro existente
            $sql = "UPDATE ADMIN SET IBAN = :iban WHERE ID_Admin = :id_admin";
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute([
                ':iban' => $iban,
                ':id_admin' => $idAdmin
            ]);

            echo json_encode($success ? ["sucesso" => true] : ["erro" => "Erro ao atualizar IBAN."]);
        }
        break;

    case 'listar_metodos_pagamento':
        $sql = "SELECT ID_Metodo_Pagamento, Estado FROM Metodo_Pagamento";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $metodos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'sucesso' => true,
            'metodos' => $metodos
        ]);
        break;
    
    case 'alterar_estado':
        $idMetodo = $_POST['id_metodo'];
        $estado = $_POST['estado'];

        $sql = "UPDATE Metodo_Pagamento SET Estado = :estado WHERE ID_Metodo_Pagamento = :id_metodo";
        $stmt = $pdo->prepare($sql);
        $success = $stmt->execute([
            ':estado' => $estado,
            ':id_metodo' => $idMetodo
        ]);

        echo json_encode(['sucesso' => $success]);
        break;

    case 'receita_por_evento':
        $sql = "
            SELECT 
                ID_Evento,
                SUM(
                    CASE 
                        WHEN Gratuito = 1 THEN 0
                        ELSE Preco * (1 - IFNULL(Desconto, 0)) * IFNULL(Quant_Vendida, 0)
                    END
                ) AS Receita_Total
            FROM BILHETES
            GROUP BY ID_Evento
        ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo json_encode([
                'successo' => false,
                'erro' => 'Erro na base de dados: ' . $e->getMessage()
            ]);
        }
        echo json_encode([
            'successo' => true,
            'data' => $dados
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(["erro" => "Ação inválida ou não especificada"]);
        break;
}
