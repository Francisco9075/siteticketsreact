<?php
// Configuração da base de dados
$host = '188.245.212.195';
$database = 'makeitreal_tickets';
$username = 'makeitreal_tickets';
$password = '+4NH{5r910FQ';

// Headers para CORS
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// Tratamento da requisição OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Conexão à base de dados
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Determinar a ação baseada no método HTTP e parâmetros
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $user_id = $_GET['user_id'] ?? 1; // ID padrão para teste
    
    switch ($method) {
        case 'GET':
            if ($action === 'profile') {
                getUserProfile($pdo, $user_id);
            } elseif ($action === 'test') {
                testConnection($pdo);
            } else {
                getUserProfile($pdo, $user_id);
            }
            break;
            
        case 'POST':
            if ($action === 'update') {
                updateUserProfile($pdo, $user_id);
            } elseif ($action === 'uploadPhoto') {
                uploadProfilePhoto($pdo, $user_id);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Ação não especificada para POST']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
            break;
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro de conexão à base de dados: ' . $e->getMessage()]);
}

// Função para obter o perfil do utilizador
function getUserProfile($pdo, $user_id) {
    try {
        $stmt = $pdo->prepare("SELECT id, primeiro_nome, sobrenome, email, telefone, biografia, pais, cidade_estado, codigo_postal, url_foto_perfil FROM perfis_usuarios WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $profile = [
                'id' => $user['id'],
                'firstName' => $user['primeiro_nome'] ?? '',
                'lastName' => $user['sobrenome'] ?? '',
                'email' => $user['email'] ?? '',
                'phone' => $user['telefone'] ?? '',
                'bio' => $user['biografia'] ?? '',
                'country' => $user['pais'] ?? '',
                'city' => $user['cidade_estado'] ?? '',
                'postalCode' => $user['codigo_postal'] ?? '',
                'profilePhoto' => $user['url_foto_perfil'] ?? '/images/user/owner.jpg',
                'fullName' => trim(($user['primeiro_nome'] ?? '') . ' ' . ($user['sobrenome'] ?? '')),
                'socialLinks' => [
                    'facebook' => 'https://www.facebook.com/PimjoHQ',
                    'twitter' => 'https://x.com/PimjoHQ',
                    'linkedin' => 'https://www.linkedin.com/company/pimjo',
                    'instagram' => 'https://instagram.com/PimjoHQ'
                ]
            ];
            
            echo json_encode(['success' => true, 'data' => $profile]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Utilizador não encontrado']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao obter perfil: ' . $e->getMessage()]);
    }
}

// Função para atualizar o perfil do utilizador
function updateUserProfile($pdo, $user_id) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
            return;
        }
        
        $updateFields = [];
        $values = [];
        
        // Mapear campos do frontend para o banco de dados
        $fieldMapping = [
            'firstName' => 'primeiro_nome',
            'lastName' => 'sobrenome',
            'email' => 'email',
            'phone' => 'telefone',
            'bio' => 'biografia',
            'country' => 'pais',
            'city' => 'cidade_estado',
            'postalCode' => 'codigo_postal',
            'profilePhoto' => 'url_foto_perfil'
        ];
        
        foreach ($fieldMapping as $frontendField => $dbField) {
            if (isset($input[$frontendField])) {
                $updateFields[] = "$dbField = ?";
                $values[] = $input[$frontendField];
            }
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Nenhum campo válido para atualizar']);
            return;
        }
        
        $values[] = $user_id;
        $sql = "UPDATE perfis_usuarios SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso']);
        } else {
            echo json_encode(['success' => true, 'message' => 'Nenhuma alteração foi necessária']);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao atualizar perfil: ' . $e->getMessage()]);
    }
}

// Função para upload de foto de perfil
function uploadProfilePhoto($pdo, $user_id) {
    try {
        if (!isset($_FILES['profilePhoto'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No file uploaded']);
            return;
        }

        $file = $_FILES['profilePhoto'];
        
        // Validate the file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, and GIF are allowed.']);
            return;
        }

        if ($file['size'] > 5 * 1024 * 1024) { // 5MB max
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'File too large. Max size is 5MB.']);
            return;
        }

        // Create uploads directory if it doesn't exist
        $uploadDir = 'uploads/profile_photos/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'user_' . $user_id . '_' . time() . '.' . $extension;
        $destination = $uploadDir . $filename;

        // Move the uploaded file
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            // Update database with new photo URL
            $url = 'http://' . $_SERVER['HTTP_HOST'] . '/' . $destination;
            $stmt = $pdo->prepare("UPDATE perfis_usuarios SET url_foto_perfil = ? WHERE id = ?");
            $stmt->execute([$url, $user_id]);

            echo json_encode([
                'success' => true,
                'url' => $url,
                'message' => 'Profile photo updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error uploading photo: ' . $e->getMessage()]);
    }
}

// Função para testar a conexão
function testConnection($pdo) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM perfis_usuarios");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true, 
            'message' => 'Conexão bem-sucedida', 
            'total_users' => $result['total']
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false, 
            'error' => 'Erro na conexão: ' . $e->getMessage()
        ]);
    }
}
?>