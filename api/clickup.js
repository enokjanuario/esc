// Vercel Serverless Function - ClickUp Integration (Multi-tenant)

module.exports = async (req, res) => {
    // Configurar CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Apenas aceitar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Configurações padrão do ClickUp (usadas quando cliente não tem config própria)
    const DEFAULT_TOKEN = 'pk_266413314_788FI3PPPVHO7AN8W8EO9DRE3FNL6Y7O';
    const DEFAULT_LIST_ID = '901323227565';

    try {
        const data = req.body;

        // Validar dados obrigatórios
        if (!data.nome || !data.whatsapp) {
            return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios' });
        }

        // Determinar qual lista e token usar (multi-tenant)
        const listId = data.clickup_list_id || DEFAULT_LIST_ID;
        const token = data.clickup_token || DEFAULT_TOKEN;

        // Log para debug (aparece nos logs do Vercel)
        console.log(`[ClickUp] Cliente: ${data.cliente || 'default'}, Lista: ${listId}`);

        // Formatar valor do crédito
        const valorFormatado = parseInt(data.valor_credito || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        // Criar descrição detalhada da task
        const descricao = `## Dados do Lead
        

**Nome:** ${data.nome}
**WhatsApp:** ${data.whatsapp}
**Localização:** ${data.cidade || '-'} - ${data.estado || '-'}

---

## Solicitação

**Valor do Crédito:** ${valorFormatado}
**Tem CNPJ:** ${data.tem_cnpj === 'sim' ? 'Sim' : 'Não'}
**Tem Fachada:** ${data.tem_fachada === 'sim' ? 'Sim' : 'Não'}

---

## Rastreamento

**Cliente/Rota:** ${data.cliente || 'default'}
**Origem:** ${data.utm_source || data.referrer || 'Acesso direto'}
**Mídia:** ${data.utm_medium || '-'}
**Campanha:** ${data.utm_campaign || '-'}
**Data/Hora:** ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;

        // Criar tags baseadas nas respostas
        const tags = [];
        if (data.tem_cnpj === 'sim') tags.push('tem-cnpj');
        if (data.tem_fachada === 'sim') tags.push('tem-fachada');

        // Tag de valor
        const valor = parseInt(data.valor_credito || 0);
        if (valor <= 2000) tags.push('valor-baixo');
        else if (valor <= 5000) tags.push('valor-medio');
        else tags.push('valor-alto');

        // Payload para o ClickUp
        const payload = {
            name: `Lead: ${data.nome} - ${valorFormatado}`,
            description: descricao,
            tags: tags,
            priority: 2,
            notify_all: true
        };

        // Enviar para ClickUp
        const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({
                error: 'Erro ao criar task no ClickUp',
                details: errorData
            });
        }

        const result = await response.json();

        return res.status(200).json({
            success: true,
            taskId: result.id,
            taskUrl: result.url
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
};
