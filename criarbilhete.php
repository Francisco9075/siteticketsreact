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

$conn->close();
?>