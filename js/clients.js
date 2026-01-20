/**
 * Configuração de Clientes (Multi-tenancy)
 *
 * Cada cliente é identificado pela rota (slug) e possui:
 * - nome: Nome de exibição do cliente
 * - clickup.listId: ID da lista no ClickUp para esse cliente
 * - estados: Array de siglas dos estados disponíveis
 * - cidades: Objeto com arrays de cidades por estado
 * - pixel (opcional): ID do Meta Pixel específico
 * - gtm (opcional): ID do GTM específico
 *
 * Para adicionar um novo cliente:
 * 1. Adicione uma nova entrada no objeto CLIENTS abaixo
 * 2. Use o slug como chave (será a rota: seusite.com/slug)
 * 3. Configure o listId do ClickUp (obtenha em: ClickUp > Lista > ... > Copy Link)
 * 4. Liste os estados e cidades disponíveis
 */

const CLIENTS = {
    // ============================================
    // Cliente: Multi Cidades (São Paulo)
    // Rota: /multicidades
    // ============================================
    'multicidades': {
        nome: 'Multi Cidades SP',
        clickup: {
            listId: '901324566139'
        },
        estados: ['SP'],
        cidades: {
            'SP': [
                'Americana',
                'Indaiatuba',
                'Nova Odessa',
                'Salto',
                'Santa Bárbara d\'Oeste',
                'Sumaré'
            ]
        },
        // Opcional: pixel e gtm específicos
        // pixel: '1910741219561489',
        // gtm: 'GTM-XXXXXX'
    },

    // ============================================
    // Cliente: Serra (Espírito Santo)
    // Rota: /serra
    // ============================================
    'serra': {
        nome: 'Serra ES',
        clickup: {
            listId: '901324566317'
        },
        estados: ['ES'],
        cidades: {
            'ES': [
                'Cariacica',
                'Serra',
                'Vila Velha',
                'Vitória'
            ]
        }
    },

    // ============================================
    // TEMPLATE PARA NOVOS CLIENTES
    // Copie e cole abaixo, substituindo os valores
    // ============================================
    /*
    'slug-do-cliente': {
        nome: 'Nome do Cliente',
        clickup: {
            listId: 'ID_DA_LISTA_CLICKUP'
        },
        estados: ['UF1', 'UF2'], // Ex: ['SP', 'RJ']
        cidades: {
            'UF1': ['Cidade 1', 'Cidade 2'],
            'UF2': ['Cidade 3', 'Cidade 4']
        },
        // Opcional:
        // pixel: 'ID_DO_PIXEL',
        // gtm: 'GTM-ID'
    },
    */
};

// ============================================
// Configuração Padrão (fallback)
// Usada quando a rota não corresponde a nenhum cliente
// ============================================
const DEFAULT_CONFIG = {
    nome: 'ESC Crédito',
    clickup: {
        listId: '901323227565'
    },
    // null = usar todos os estados/cidades da API do IBGE
    estados: null,
    cidades: null
};

// ============================================
// Funções de Utilidade
// ============================================

/**
 * Obtém o slug do cliente a partir da URL atual
 * Exemplos:
 *   - seusite.com/multicidades -> 'multicidades'
 *   - seusite.com/serra -> 'serra'
 *   - seusite.com/ -> null
 */
function getClientSlug() {
    const path = window.location.pathname;
    // Remove barras iniciais e finais, pega o primeiro segmento
    const segments = path.replace(/^\/|\/$/g, '').split('/');
    const slug = segments[0] || null;

    // Ignora se for um arquivo (ex: index.html)
    if (slug && (slug.includes('.') || slug === 'index')) {
        return null;
    }

    return slug;
}

/**
 * Obtém a configuração do cliente atual baseado na rota
 * @returns {Object} Configuração do cliente ou DEFAULT_CONFIG
 */
function getClientConfig() {
    const slug = getClientSlug();

    if (slug && CLIENTS[slug]) {
        console.log(`[ESC] Cliente identificado: ${CLIENTS[slug].nome} (${slug})`);
        return { ...DEFAULT_CONFIG, ...CLIENTS[slug], slug };
    }

    console.log('[ESC] Usando configuração padrão');
    return { ...DEFAULT_CONFIG, slug: null };
}

/**
 * Verifica se um estado está disponível para o cliente atual
 * @param {string} sigla - Sigla do estado (ex: 'SP')
 * @param {Object} config - Configuração do cliente
 * @returns {boolean}
 */
function isEstadoDisponivel(sigla, config) {
    if (!config.estados) return true; // null = todos disponíveis
    return config.estados.includes(sigla);
}

/**
 * Obtém as cidades disponíveis para um estado
 * @param {string} sigla - Sigla do estado
 * @param {Object} config - Configuração do cliente
 * @returns {Array|null} Array de cidades ou null para usar API do IBGE
 */
function getCidadesDisponiveis(sigla, config) {
    if (!config.cidades) return null; // null = usar API do IBGE
    return config.cidades[sigla] || [];
}

// Exporta para uso global
window.ESC_CLIENTS = {
    CLIENTS,
    DEFAULT_CONFIG,
    getClientSlug,
    getClientConfig,
    isEstadoDisponivel,
    getCidadesDisponiveis
};
