<?php
// CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Cache-busting headers
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

// Lidar com requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Dados de conexão com a base de dados
$host = '188.245.212.195';
$dbname = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // ========================
    // Requisição POST (criar ticket)
    // ========================
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validar campos obrigatórios
        if (!isset($data['nome'], $data['tipo'], $data['preco'], $data['id_evento'])) {
            echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
            exit();
        }

        // Validar id_evento como número
        if (!is_numeric($data['id_evento'])) {
            echo json_encode(['success' => false, 'message' => 'ID do evento inválido']);
            exit();
        }

        $sql = "INSERT INTO BILHETES (
                    NOME, Tipo, Preco, ID_Evento, 
                    Quant_Disponivel, Quant_Vendida, Data, 
                    Gratuito, ID_Estado_Bilhete
                ) VALUES (
                    :nome, :tipo, :preco, :id_evento, 
                    :quant_disponivel, :quant_vendida, :data, 
                    :gratuito, :id_estado
                )";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nome' => $data['nome'],
            ':tipo' => $data['tipo'],
            ':preco' => $data['preco'],
            ':id_evento' => $data['id_evento'],
            ':quant_disponivel' => $data['quant_disponivel'] ?? 0,
            ':quant_vendida' => $data['quant_vendida'] ?? 0,
            ':data' => $data['data'] ?? date('Y-m-d'),
            ':gratuito' => $data['gratuito'] ?? 0,
            ':id_estado' => $data['id_estado'] ?? 1
        ]);

        echo json_encode(['success' => true, 'message' => 'Bilhete criado com sucesso']);
        exit();
    }

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
            EVENTOS.NOME AS Evento_Nome,
            Estado_Bilhete.Nome AS Estado_Nome
        FROM BILHETES
        LEFT JOIN EVENTOS ON BILHETES.ID_Evento = EVENTOS.ID_Evento
        LEFT JOIN Estado_Bilhete ON BILHETES.ID_Estado_Bilhete = Estado_Bilhete.ID_Estado_Bilhete
        ORDER BY ID_Bilhetes DESC";

        $stmt = $pdo->query($sql);
        $bilhetes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'bilhetes' => $bilhetes]);
        exit();
    }

    // ========================
    // Outros métodos não suportados
    // ========================
    echo json_encode(['success' => false, 'message' => 'Método não suportado']);
    http_response_code(405); // Method Not Allowed

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>
