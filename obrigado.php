<?php
<?php
// Inicie a sessão se necessário
session_start();

// Conexão com o banco de dados (certifique-se que $pdo está definido)
require_once 'config.php'; // Ou inclua sua conexão PDO aqui

$saleId = $_GET['id'] ?? null;
if (!$saleId) {
    header("Location: /");
    exit();
}

try {
    // Buscar dados da venda
    $stmt = $pdo->prepare("
        SELECT v.*, c.Nome AS Cliente_Nome 
        FROM VENDAS v
        JOIN CLIENTES c ON v.ID_Clientes = c.ID_Cliente
        WHERE v.ID_Vendas = ?
    ");
    $stmt->execute([$saleId]);
    $venda = $stmt->fetch();

    // Se não encontrar a venda
    if (!$venda) {
        header("Location: /");
        exit();
    }
} catch (PDOException $e) {
    // Log do erro (em produção, não mostre ao usuário)
    error_log("Erro ao buscar venda: " . $e->getMessage());
    header("Location: /");
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Compra Confirmada</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .ticket { border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
        .error { color: red; }
    </style>
</head>
<body>
    <?php if (isset($venda)): ?>
        <h1>✅ Obrigado pela sua compra, <?= htmlspecialchars($venda['Cliente_Nome']) ?>!</h1>
        
        <div class="ticket">
            <h2>Resumo da Compra #<?= htmlspecialchars($saleId) ?></h2>
            <p><strong>Data:</strong> <?= htmlspecialchars($venda['Data']) ?></p>
            <p><strong>Total Pago:</strong> <?= number_format($venda['Valor_Total'], 2) ?> €</p>
            <p>Um email com os detalhes foi enviado para você.</p>
        </div>
    <?php else: ?>
        <div class="error">
            <p>Não foi possível encontrar os detalhes da sua compra.</p>
        </div>
    <?php endif; ?>

    <a href="/">Voltar à página inicial</a>
</body>
</html>