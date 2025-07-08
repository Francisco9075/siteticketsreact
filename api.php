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
            // ... (mantenha o mesmo conteúdo da função generatePaymentPage que você já tem)
            // Esta função pode permanecer exatamente como estava
            // ...
}

switch ($action) {
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
