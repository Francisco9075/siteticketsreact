<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Configuração da base de dados
$host = '188.245.212.195';
$database = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['error' => 'Erro de conexão: ' . $e->getMessage()]));
}

// Função para buscar dados do usuário
function getUserData($userId = 1) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM perfis_usuarios WHERE id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            return [
                'success' => true,
                'data' => $user
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Usuário não encontrado'
            ];
        }
    } catch(PDOException $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Função para atualizar dados do usuário
function updateUserData($userId, $data) {
    global $pdo;
    
    try {
        $sql = "UPDATE perfis_usuarios SET 
                primeiro_nome = :primeiro_nome,
                sobrenome = :sobrenome,
                email = :email,
                telefone = :telefone,
                biografia = :biografia,
                pais = :pais,
                cidade = :cidade,
                codigo_postal = :codigo_postal,
                url_foto_perfil = :url_foto_perfil
                WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $userId);
        $stmt->bindParam(':primeiro_nome', $data['primeiro_nome']);
        $stmt->bindParam(':sobrenome', $data['sobrenome']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':telefone', $data['telefone']);
        $stmt->bindParam(':biografia', $data['biografia']);
        $stmt->bindParam(':pais', $data['pais']);
        $stmt->bindParam(':cidade', $data['cidade']);
        $stmt->bindParam(':codigo_postal', $data['codigo_postal']);
        $stmt->bindParam(':url_foto_perfil', $data['url_foto_perfil']);
        
        $stmt->execute();
        
        return [
            'success' => true,
            'message' => 'Dados atualizados com sucesso'
        ];
    } catch(PDOException $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Roteamento da API
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch($method) {
    case 'GET':
        if (strpos($path, '/user/') !== false) {
            $userId = (int)basename($path);
            echo json_encode(getUserData($userId));
        } else {
            echo json_encode(getUserData());
        }
        break;
        
    case 'POST':
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = isset($input['id']) ? $input['id'] : 1;
        echo json_encode(updateUserData($userId, $input));
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>