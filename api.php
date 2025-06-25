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

$action = $_GET['action'] ?? $_POST['action'] ?? null;

switch ($action) {

    // 🔹 GET ALL METRICS
    case 'get_all_metrics':
        try {
            $sql = "
                SELECT 
                    (SELECT COUNT(*) FROM Evento WHERE Data_Fim >= NOW() OR Data_Fim IS NULL) as active_events,
                    (SELECT COUNT(*) FROM Evento 
                        WHERE Data_Inicio >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
                        AND (Data_Fim >= NOW() OR Data_Fim IS NULL)) as new_events_this_month,
                    (SELECT COUNT(*) FROM Evento 
                        WHERE Data_Inicio >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
                        AND Data_Inicio < DATE_SUB(NOW(), INTERVAL 1 MONTH)
                        AND (Data_Fim >= DATE_SUB(NOW(), INTERVAL 1 MONTH) OR Data_Fim IS NULL)) as new_events_last_month,
                    (SELECT COALESCE(SUM(Valor_Total), 0) FROM Vendas 
                        WHERE Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)) as total_revenue,
                    (SELECT COALESCE(SUM(Valor_Total), 0) FROM Vendas 
                        WHERE Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) as current_month_revenue,
                    (SELECT COALESCE(SUM(Valor_Total), 0) FROM Vendas 
                        WHERE Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) AND Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)) as last_month_revenue,
                    (SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) 
                        FROM Vendas_Detalhes vd 
                        INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                        WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)) as total_tickets,
                    (SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) 
                        FROM Vendas_Detalhes vd 
                        INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                        WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) as current_month_tickets,
                    (SELECT COALESCE(SUM(vd.Quant_Bilhetes), 0) 
                        FROM Vendas_Detalhes vd 
                        INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                        WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) AND v.Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)) as last_month_tickets
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $r = $stmt->fetch(PDO::FETCH_ASSOC);

            $eventsPct = $r['new_events_last_month'] > 0 
                ? (($r['new_events_this_month'] - $r['new_events_last_month']) / $r['new_events_last_month']) * 100 : 0;

            $revPct = $r['last_month_revenue'] > 0 
                ? (($r['current_month_revenue'] - $r['last_month_revenue']) / $r['last_month_revenue']) * 100 : 0;

            $ticketsPct = $r['last_month_tickets'] > 0 
                ? (($r['current_month_tickets'] - $r['last_month_tickets']) / $r['last_month_tickets']) * 100 : 0;

            echo json_encode([
                'successo' => true,
                'data' => [
                    'active_events' => [
                        'count' => intval($r['active_events']),
                        'percentage_change' => round($eventsPct, 2),
                        'trend' => $eventsPct >= 0 ? 'up' : 'down',
                        'current_month' => intval($r['new_events_this_month']),
                        'last_month' => intval($r['new_events_last_month'])
                    ],
                    'total_revenue' => [
                        'amount' => number_format($r['total_revenue'], 2, '.', ''),
                        'percentage_change' => round($revPct, 2),
                        'trend' => $revPct >= 0 ? 'up' : 'down',
                        'current_month' => number_format($r['current_month_revenue'], 2, '.', ''),
                        'last_month' => number_format($r['last_month_revenue'], 2, '.', '')
                    ],
                    'tickets_sold' => [
                        'count' => intval($r['total_tickets']),
                        'percentage_change' => round($ticketsPct, 2),
                        'trend' => $ticketsPct >= 0 ? 'up' : 'down',
                        'current_month' => intval($r['current_month_tickets']),
                        'last_month' => intval($r['last_month_tickets'])
                    ]
                ],
                'timestamp' => date('Y-m-d H:i:s'),
                'query_time' => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['successo' => false, 'message' => $e->getMessage()]);
        }
        break;

    // 🔹 ACTIVE EVENTS
    case 'active_events':
        try {
            $eventTable = 'EVENTOS';
            $desc = $pdo->query("DESCRIBE $eventTable")->fetchAll(PDO::FETCH_ASSOC);
            $columns = array_column($desc, 'Field');

            $startDateCol = null;
            $endDateCol = null;
            $statusCol = null;

            foreach ($columns as $col) {
                $colLower = strtolower($col);

                if (!$startDateCol && (str_contains($colLower, 'inicio') || str_contains($colLower, 'start'))) {
                    $startDateCol = $col;
                }

                if (!$endDateCol && (str_contains($colLower, 'fim') || str_contains($colLower, 'end'))) {
                    $endDateCol = $col;
                }

                if (!$statusCol && (str_contains($colLower, 'estado') || str_contains($colLower, 'status') || str_contains($colLower, 'ativo') || str_contains($colLower, 'active'))) {
                    $statusCol = $col;
                }
            }

            $query = "";
            if ($statusCol) {
                $query = "SELECT COUNT(*) FROM $eventTable WHERE `$statusCol` IN ('ativo', 'active', '1', 'ATIVO', 'ACTIVE')";
            } elseif ($endDateCol) {
                $query = "SELECT COUNT(*) FROM $eventTable WHERE `$endDateCol` >= NOW() OR `$endDateCol` IS NULL";
            } else {
                $query = "SELECT COUNT(*) FROM $eventTable"; // fallback
            }

            $count = $pdo->query($query)->fetchColumn();

            echo json_encode([
                'successo' => true,
                'data' => [
                    'active_events' => intval($count),
                    'query_usada' => $query,
                    'detetado' => [
                        'status_coluna' => $statusCol,
                        'end_coluna' => $endDateCol
                    ]
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'successo' => false,
                'message' => 'Erro ao obter eventos ativos: ' . $e->getMessage()
            ]);
        }
        break;

    
    // 🔹 TOTAL REVENUE
    case 'total_revenue':
        try {
            $r = [];

            $r['total'] = $pdo->query("SELECT COALESCE(SUM(Valor_Total),0) FROM Vendas WHERE Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)")->fetchColumn();
            $r['last'] = $pdo->query("SELECT COALESCE(SUM(Valor_Total),0) FROM Vendas WHERE Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) AND Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn();
            $r['current'] = $pdo->query("SELECT COALESCE(SUM(Valor_Total),0) FROM Vendas WHERE Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn();

            $pct = $r['last'] > 0 ? (($r['current'] - $r['last']) / $r['last']) * 100 : 0;

            echo json_encode([
                'successo' => true,
                'data' => [
                    'total_revenue' => number_format($r['total'], 2),
                    'current_month_revenue' => number_format($r['current'], 2),
                    'last_month_revenue' => number_format($r['last'], 2),
                    'percentage_change' => round($pct, 2),
                    'trend' => $pct >= 0 ? 'up' : 'down'
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['successo' => false, 'message' => $e->getMessage()]);
        }
        break;

    // 🔹 TICKETS SOLD
    case 'tickets_sold':
        try {
            $total = $pdo->query("SELECT COALESCE(SUM(vd.Quant_Bilhetes),0)
                                  FROM Vendas_Detalhes vd 
                                  INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                                  WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 12 MONTH)")->fetchColumn();

            $last = $pdo->query("SELECT COALESCE(SUM(vd.Quant_Bilhetes),0)
                                 FROM Vendas_Detalhes vd 
                                 INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                                 WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 2 MONTH) 
                                 AND v.Data < DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn();

            $current = $pdo->query("SELECT COALESCE(SUM(vd.Quant_Bilhetes),0)
                                    FROM Vendas_Detalhes vd 
                                    INNER JOIN Vendas v ON vd.ID_Vendas = v.ID_Vendas 
                                    WHERE v.Data >= DATE_SUB(NOW(), INTERVAL 1 MONTH)")->fetchColumn();

            $pct = $last > 0 ? (($current - $last) / $last) * 100 : 0;

            echo json_encode([
                'successo' => true,
                'data' => [
                    'total_tickets' => intval($total),
                    'current_month_tickets' => intval($current),
                    'last_month_tickets' => intval($last),
                    'percentage_change' => round($pct, 2),
                    'trend' => $pct >= 0 ? 'up' : 'down'
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['successo' => false, 'message' => $e->getMessage()]);
        }
        break;


    //section bilhetes
    case 'criar_bilhete':
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

            $sql = "INSERT INTO BILHETES (NOME, Tipo, Preco, Quant_Disponivel, Data, Gratuito, payment_page_url) 
                    VALUES ('$nome', '$tipo', $precoFinal, $quantidade, '$dataEvento', $gratuito, '$paymentPageUrl')";

            if ($conn->query($sql)) {
                $ticketId = $conn->insert_id;
                
                // Create the payment page file
                $paymentPageContent = generatePaymentPage($ticketId, $nome, $tipo, $precoFinal, $quantidade, $dataEvento, $gratuito);
                
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

        function generatePaymentPage($ticketId, $nome, $tipo, $preco, $quantidade, $dataEvento, $gratuito) {
            return '<!DOCTYPE html>
        <html lang="pt">

        <head>
        <meta charset="UTF-8" />
        <title>' . htmlspecialchars($nome) . ' | Comprar Bilhete</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/akar-icons-fonts"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        </head>

        <body class="bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm">
            <div class="max-w-5xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <img src="../public/images/logo/LOGO_PRETO.png" alt="Logo" class="relative inset-0 mx-auto h-10 opacity-100 z-10">
            </div>
            </div>
        </header>

        <main class="max-w-5xl mx-auto px-4 py-8">
            <!-- Event Info Banner -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-8">
            <h1 class="text-3xl font-bold mb-2">' . htmlspecialchars($nome) . '</h1>
            <p class="text-lg opacity-90">' . htmlspecialchars($tipo) . '</p>
            <p class="text-sm opacity-75 mt-2">📅 ' . date('d/m/Y', strtotime($dataEvento)) . '</p>
            </div>

            <form id="checkoutForm" method="POST" action="../comprarbilhete.php" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <input type="hidden" name="ticket_id" value="' . $ticketId . '">
            
            <!-- Checkout Form -->
            <div class="lg:col-span-2 space-y-8">
                <!-- Ticket Info -->
                <section class="bg-white p-6 rounded-lg shadow-sm">
                <h2 class="text-xl font-semibold mb-4">Bilhete Selecionado 🎟️</h2>
                <div class="p-4 border rounded-lg bg-gray-50">
                    <div class="font-semibold text-lg">' . htmlspecialchars($nome) . '</div>
                    <div class="text-gray-600">' . htmlspecialchars($tipo) . '</div>
                    <div class="text-2xl font-bold text-green-600 mt-2">' . ($gratuito ? 'GRATUITO' : $preco . '€') . '</div>
                    <div class="text-sm text-gray-500 mt-1">Disponível: ' . $quantidade . ' bilhetes</div>
                </div>
                </section>
                
                <!-- Personal Information -->
                <section class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold">Informações Pessoais</h2>
                </div>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="primeiro_nome" class="block text-sm font-medium text-gray-700 mb-1">Primeiro Nome*</label>
                        <input type="text" id="primeiro_nome" name="primeiro_nome" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="Pedro" required>
                        <p id="erro-primeiro-nome" class="text-red-500 text-sm mt-1 hidden">Por favor, preenche o primeiro nome.</p>
                    </div>
                    <div>
                        <label for="segundo_nome" class="block text-sm font-medium text-gray-700 mb-1">Último Nome*</label>
                        <input type="text" id="segundo_nome" name="segundo_nome" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="Sousa" required>
                        <p id="erro-segundo-nome" class="text-red-500 text-sm mt-1 hidden">Por favor, preenche o último nome.</p>
                    </div>
                    </div>
                    <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input type="email" id="email" name="email" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="exemplo@gmail.com" required>
                    <p id="erro-email" class="text-red-500 text-sm mt-1 hidden">Por favor, insere um email válido.</p>
                    </div>
                    <div>
                    <label for="telefone" class="block text-sm font-medium text-gray-700 mb-1">Telefone*</label>
                    <input type="tel" id="telefone" name="telefone" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="912345678" required>
                    <p id="erro-telefone" class="text-red-500 text-sm mt-1 hidden">Por favor, insere um número de telefone válido.</p>
                    </div>

                    <!-- Billing Data Toggle -->
                    <div class="flex items-center mt-4">
                    <input type="checkbox" id="toggleBilling" name="fatura_dados" class="mr-2 w-4 h-4 text-black focus:ring-black border-gray-300 rounded">
                    <label for="toggleBilling" class="text-sm text-gray-700">Adicionar dados de faturação</label>
                    </div>

                    <!-- Billing Form (initially hidden) -->
                    <div id="billingForm" class="mt-4 hidden">
                    <h3 class="text-lg font-semibold mb-2">Dados de Faturação Completos</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label for="nome_faturacao" class="block text-sm font-medium text-gray-700 mb-1">Nome para Faturação</label>
                        <input type="text" id="nome_faturacao" name="nome_faturacao" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="Nome Completo">
                        </div>
                        <div>
                        <label for="nif" class="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                        <input type="text" id="nif" name="nif_faturacao" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="123456789">
                        </div>
                    </div>
                    <div class="mt-4">
                        <label for="endereco" class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                        <input type="text" id="endereco" name="morada_faturacao" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="Rua Exemplo, nº 123">
                    </div>
                    </div>
                </div>
                </section>

                ' . ($gratuito ? '' : '<!-- Payment Method -->
                <section class="bg-white p-6 rounded-lg shadow-sm">
                <h2 class="text-xl font-semibold mb-4">Método de Pagamento</h2>
                <div class="space-y-4">
                    <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:border-black">
                    <input type="radio" name="payment" value="mbway" class="form-radio text-black" required checked>
                    <div class="ml-4 flex items-center">
                        <img src="../public/images/logo/mbway_logo.svg" alt="MB Way Logo" class="h-6 mr-3">
                        <div>
                        <div class="font-semibold">MB Way</div>
                        <div class="text-sm text-gray-600">Pagamento rápido e seguro</div>
                        </div>
                    </div>
                    </label>

                    <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:border-black">
                    <input type="radio" name="payment" value="card" class="form-radio text-black">
                    <div class="ml-4 flex items-center">
                        <div class="flex space-x-2 mr-3">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 7a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m0 13c-5.33 0-16-2.67-16-8v-6l16-3 16 3v6c0 5.33-10.67 8-16 8z"></path>
                        </svg>
                        </div>
                        <div>
                        <div class="font-semibold">Cartão de Crédito/Débito</div>
                        <div class="text-sm text-gray-600">Visa, Mastercard, etc.</div>
                        </div>
                    </div>
                    </label>
                    <div id="mbwayFields" class="mt-4">
                    <label for="mbway_phone" class="block text-sm font-medium text-gray-700 mb-1">Telefone MB Way*</label>
                    <input type="tel" id="mbway_phone" name="mbway_phone" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="912345678">
                    </div>
                    <div id="cardFields" class="mt-4 hidden">
                    <!-- Card fields would go here -->
                    </div>
                </div>
                </section>') . '
            </div>

            <!-- Order Summary -->
            <div class="space-y-8">
                <section class="bg-white p-6 rounded-lg shadow-sm sticky top-8">
                <h2 class="text-xl font-semibold mb-4">Resumo da Encomenda</h2>
                <div class="space-y-4">
                    <div class="flex justify-between">
                    <span class="text-gray-600">Bilhete</span>
                    <span class="font-medium">' . htmlspecialchars($nome) . '</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">Quantidade</span>
                    <input type="number" name="quantity" min="1" max="' . $quantidade . '" value="1" class="w-16 p-1 border rounded text-center">
                    </div>
                    <div class="border-t border-gray-200 my-2"></div>
                    <div class="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span id="total-summary">' . ($gratuito ? 'GRATUITO' : $preco . '€') . '</span>
                    </div>
                    <button type="submit" class="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    ' . ($gratuito ? 'Reservar Bilhete' : 'Finalizar Compra') . '
                    </button>
                    <p class="text-xs text-gray-500 mt-2">
                    Ao finalizar, concorda com os nossos <a href="#" class="underline">Termos e Condições</a>.
                    </p>
                </div>
                </section>
            </div>
            </form>
        </main>

        <footer class="bg-white border-t mt-12 py-6">
            <div class="max-w-5xl mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-4 md:mb-0">
                <img src="../public/images/logo/LOGO_PRETO.png" alt="Logo" class="h-8">
                </div>
                <div class="text-sm text-gray-600">
                <p>© 2025 SOLLEC. Todos os direitos reservados.</p>
                </div>
            </div>
            </div>
        </footer>

        <script>
            const isGratuito = ' . ($gratuito ? 'true' : 'false') . ';
            const ticketPrice = ' . $preco . ';

            // Toggle billing form
            const toggleBilling = document.getElementById("toggleBilling");
            const billingForm = document.getElementById("billingForm");
            if (toggleBilling && billingForm) {
            toggleBilling.addEventListener("change", () => {
                billingForm.classList.toggle("hidden", !toggleBilling.checked);
            });
            }

            // Payment method toggle (only if not free)
            if (!isGratuito) {
            const paymentMethods = document.querySelectorAll("input[name=\"payment\"]");
            const mbwayFields = document.getElementById("mbwayFields");
            const cardFields = document.getElementById("cardFields");

            paymentMethods.forEach(method => {
                method.addEventListener("change", () => {
                if (method.value === "mbway") {
                    mbwayFields.classList.remove("hidden");
                    cardFields.classList.add("hidden");
                } else {
                    mbwayFields.classList.add("hidden");
                    cardFields.classList.remove("hidden");
                }
                });
            });
            }

            // Quantity change handler
            const quantityInput = document.querySelector("input[name=\"quantity\"]");
            const totalSummary = document.getElementById("total-summary");
            
            if (quantityInput && totalSummary) {
            quantityInput.addEventListener("change", () => {
                const quantity = parseInt(quantityInput.value) || 1;
                if (!isGratuito) {
                const total = (ticketPrice * quantity).toFixed(2);
                totalSummary.textContent = total + "€";
                }
            });
            }

            // Form validation and submission
            const form = document.getElementById("checkoutForm");
            form.addEventListener("submit", async (e) => {
            e.preventDefault();

            let isValid = true;
            const requiredFields = form.querySelectorAll("[required]");
            requiredFields.forEach(field => {
                const errorElement = document.getElementById(`erro-${field.id}`);
                if (!field.value.trim()) {
                if (errorElement) errorElement.classList.remove("hidden");
                field.classList.add("border-red-500");
                isValid = false;
                } else {
                if (errorElement) errorElement.classList.add("hidden");
                field.classList.remove("border-red-500");
                }
            });

            if (!isValid) return;

            const submitButton = form.querySelector("button[type=\"submit\"]");
            submitButton.disabled = true;
            submitButton.innerHTML = "<span class=\"flex items-center justify-center\"><svg class=\"animate-spin -ml-1 mr-2 h-4 w-4 text-white\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path></svg>Processing...</span>";

            try {
                const formData = new FormData(form);
                const jsonData = {
                ticket_id: formData.get("ticket_id"),
                quantity: parseInt(formData.get("quantity")) || 1,
                cliente: {
                    nome: formData.get("primeiro_nome") + " " + formData.get("segundo_nome"),
                    email: formData.get("email"),
                    contacto: formData.get("telefone"),
                    nif: formData.get("nif_faturacao") || "",
                    morada: formData.get("morada_faturacao") || "",
                    pedido_fatura: formData.get("fatura_dados") ? 1 : 0
                },
                payment_method: formData.get("payment") || "free",
                mbway_phone: formData.get("mbway_phone") || ""
                };

                const response = await fetch("../comprarbilhete.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonData)
                });

                const result = await response.json();

                if (result.success) {
                window.location.href = "../sucesso.html";
                } else {
                alert("Erro: " + (result.message || "Falha no processamento."));
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro no processamento: " + error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = ' . ($gratuito ? '"Reservar Bilhete"' : '"Finalizar Compra"') . ';
            }
            });

            // Remove error styling when user starts typing
            const inputs = form.querySelectorAll("input");
            inputs.forEach(input => {
            input.addEventListener("input", () => {
                input.classList.remove("border-red-500");
                const errorElement = document.getElementById(`erro-${input.id}`);
                if (errorElement) errorElement.classList.add("hidden");
            });
            });
        </script>
        </body>
        </html>';
        }
        break;

    case 'gerir_bilhetes':
        // ========================
        // Requisição GET (listar tickets)
        // ========================
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $sql = "SELECT
                ID_Bilhetes,
                BILHETES.NOME,
                Tipo,
                Quant_Disponivel,
                Quant_Vendida,
                Preco,
                Data,
                Gratuito,
                payment_page_url,
                EVENTOS.NOME AS ID_Evento,
                Estado_Bilhete.Nome AS ID_Estado_Bilhete
            FROM BILHETES
            INNER JOIN EVENTOS ON BILHETES.ID_Evento = EVENTOS.ID_Evento
            INNER JOIN Estado_Bilhete ON BILHETES.ID_Estado_Bilhete = Estado_Bilhete.ID_Estado_Bilhete
            ORDER BY ID_Bilhetes DESC";

            try {
            $stmt = $pdo->query($sql);
            $bilhetes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
            }

            echo json_encode(['success' => true, 'bilhetes' => $bilhetes]);
            exit();
        }

        // ========================
        // Outros métodos não suportados
        // ========================
        echo json_encode(['success' => false, 'message' => 'Método não suportado']);
        http_response_code(405); // Method Not Allowed
        break;

    
    case 'editar_bilhete':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
        exit();
        }

        // Capturar dados do POST
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
        $tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : '';
        $quant_disponivel = isset($_POST['quant_disponivel']) ? intval($_POST['quant_disponivel']) : 0;
        $quant_vendida = isset($_POST['quant_vendida']) ? intval($_POST['quant_vendida']) : 0;
        $preco = isset($_POST['preco']) ? floatval($_POST['preco']) : 0.0;
        $data = isset($_POST['data']) ? $_POST['data'] : '';
        $gratuito = isset($_POST['gratuito']) ? ($_POST['gratuito'] === '1') : false;

        // Validações básicas
        if ($id <= 0) {
            echo json_encode(['success' => false, 'message' => 'ID inválido']);
            exit();
        }

        if (empty($nome)) {
            echo json_encode(['success' => false, 'message' => 'Nome é obrigatório']);
            exit();
        }

        if (empty($tipo)) {
            echo json_encode(['success' => false, 'message' => 'Tipo é obrigatório']);
            exit();
        }

        // Verificar se o bilhete existe
        try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM BILHETES WHERE ID_Bilhetes = ?");
        $stmt->execute([$id]);
        }

        catch (PDOException $e) {
            error_log("Erro ao editar bilhete: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
        } catch (Exception $e) {
            error_log("Erro geral ao editar bilhete: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
        }
        
        if ($stmt->fetchColumn() == 0) {
            echo json_encode(['success' => false, 'message' => 'Bilhete não encontrado']);
            exit();
        }

        // Atualizar o bilhete (sem ID_Evento e ID_Estado_Bilhete)
        $sql = "UPDATE BILHETES SET 
                    NOME = ?,
                    Tipo = ?,
                    Quant_Disponivel = ?,
                    Quant_Vendida = ?,
                    Preco = ?,
                    Data = ?,
                    Gratuito = ?
                WHERE ID_Bilhetes = ?";

        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([
            $nome,
            $tipo,
            $quant_disponivel,
            $quant_vendida,
            $preco,
            $data,
            $gratuito ? 1 : 0,
            $id
        ]);

        if ($result && $stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Bilhete atualizado com sucesso']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Nenhuma alteração foi feita']);
        }
        break;
    
    case 'apagar_bilhete':
        // Captura o ID da URL query string
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        // Debug: log do ID recebido
        error_log("ID recebido para exclusão: " . $id);

        if ($id > 0) {
            // Confirma que o nome da tabela e coluna estão corretos
            try {
            $stmt = $pdo->prepare("DELETE FROM BILHETES WHERE ID_Bilhetes = ?");
            $stmt->execute([$id]);
            } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
            }

            // Confirma se algum registro foi realmente deletado
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true]);
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

    default:
        http_response_code(400);
        echo json_encode(["erro" => "Ação inválida ou não especificada"]);
        break;
}
