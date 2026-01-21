<?php
/**
 * ClickUp Integration API - Versão PHP para Hostinger
 * Multi-tenant support
 */

// Configurar headers CORS
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Apenas aceitar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Configurações padrão do ClickUp
define('DEFAULT_TOKEN', 'pk_266413314_788FI3PPPVHO7AN8W8EO9DRE3FNL6Y7O');
define('DEFAULT_LIST_ID', '901323227565');

try {
    // Ler dados JSON do body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validar dados obrigatórios
    if (empty($data['nome']) || empty($data['whatsapp'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome e WhatsApp são obrigatórios']);
        exit;
    }

    // Determinar qual lista e token usar (multi-tenant)
    $listId = !empty($data['clickup_list_id']) ? $data['clickup_list_id'] : DEFAULT_LIST_ID;
    $token = !empty($data['clickup_token']) ? $data['clickup_token'] : DEFAULT_TOKEN;

    // Log para debug
    error_log("[ClickUp] Cliente: " . ($data['cliente'] ?? 'default') . ", Lista: " . $listId);

    // Formatar valor do crédito
    $valor = intval($data['valor_credito'] ?? 0);
    $valorFormatado = 'R$' . number_format($valor, 2, ',', '.');

    // Criar descrição detalhada da task
    $descricao = "## Dados do Lead

**Nome:** {$data['nome']}
**WhatsApp:** {$data['whatsapp']}
**Localização:** " . ($data['cidade'] ?? '-') . " - " . ($data['estado'] ?? '-') . "

---

## Solicitação

**Valor do Crédito:** {$valorFormatado}
**Tem CNPJ:** " . ($data['tem_cnpj'] === 'sim' ? 'Sim' : 'Não') . "
**Tem Fachada:** " . ($data['tem_fachada'] === 'sim' ? 'Sim' : 'Não') . "

---

## Rastreamento

**Cliente/Rota:** " . ($data['cliente'] ?? 'default') . "
**Origem:** " . ($data['utm_source'] ?? $data['referrer'] ?? 'Acesso direto') . "
**Mídia:** " . ($data['utm_medium'] ?? '-') . "
**Campanha:** " . ($data['utm_campaign'] ?? '-') . "
**Data/Hora:** " . date('d/m/Y H:i:s');

    // Criar tags baseadas nas respostas
    $tags = [];
    if (($data['tem_cnpj'] ?? '') === 'sim') {
        $tags[] = 'tem-cnpj';
    }
    if (($data['tem_fachada'] ?? '') === 'sim') {
        $tags[] = 'tem-fachada';
    }

    // Tag de valor
    if ($valor <= 2000) {
        $tags[] = 'valor-baixo';
    } elseif ($valor <= 5000) {
        $tags[] = 'valor-medio';
    } else {
        $tags[] = 'valor-alto';
    }

    // Payload para o ClickUp
    $payload = [
        'name' => "Lead: {$data['nome']} - {$valorFormatado}",
        'description' => $descricao,
        'tags' => $tags,
        'priority' => 2,
        'notify_all' => true
    ];

    // Enviar para ClickUp usando cURL
    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.clickup.com/api/v2/list/{$listId}/task",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: ' . $token
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);

    curl_close($ch);

    // Verificar erros do cURL
    if ($curlError) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro na conexão com ClickUp',
            'message' => $curlError
        ]);
        exit;
    }

    // Verificar resposta do ClickUp
    $result = json_decode($response, true);

    if ($httpCode >= 400) {
        http_response_code($httpCode);
        echo json_encode([
            'error' => 'Erro ao criar task no ClickUp',
            'details' => $result
        ]);
        exit;
    }

    // Sucesso
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'taskId' => $result['id'] ?? null,
        'taskUrl' => $result['url'] ?? null
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'message' => $e->getMessage()
    ]);
}
