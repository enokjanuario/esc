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
            listId: '901324566139',
            token: 'pk_272685960_AY8GZFXNMAMY5ADTJBAJTPB9L9Q03ZMP'
        },
        estados: ['SP'],
        cidades: {
            'SP': [
                'Americana',
                'Indaiatuba',
                'Itu',
                'Limeira',
                'Nova Odessa',
                'Piracicaba',
                'Salto',
                'Santa Bárbara d\'Oeste',
                'Sumaré'
            ]
        },
        footer: {
            empresa: 'ARARAS ESC - Empresa Simples de Crédito LTDA',
            cnpj: '00.000.000/0001-00',
            email: 'contato@ararasesc.com.br',
            telefone: '(19) 00000-0000',
            copyright: '© 2026 Araras Empresa Simples de Crédito LTDA. Todos os direitos reservados.'
        }
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
            listId: '901324566317',
            token: 'pk_272686426_PTD2L9GCSSD6YXJ0U65ULTE4LK7OGZ5I'
        },
        estados: ['ES'],
        cidades: {
            'ES': [
                'Cariacica',
                'Serra',
                'Vila Velha',
                'Vitória'
            ]
        },
        footer: {
            empresa: 'SERRA ESC - Empresa Simples de Crédito LTDA',
            cnpj: '00.000.000/0001-00',
            email: 'contato@serraesc.com.br',
            telefone: '(27) 00000-0000',
            copyright: '© 2026 Serra Empresa Simples de Crédito LTDA. Todos os direitos reservados.'
        }
    },

    // ============================================
    // Cliente: ABESC - Nova Jaú (SP, GO, MS)
    // Rota: /abesc
    // ============================================
    'abesc': {
        nome: 'Nova Jaú ESC',
        pixel: '1910741219561489',
        clickup: {
            listId: '901323227565',
            token: 'pk_266413314_788FI3PPPVHO7AN8W8EO9DRE3FNL6Y7O'
        },
        estados: ['SP', 'GO', 'MS'],
        cidades: {
            'SP': [
                'Araras',
                'Águaí',
                'Barra Bonita',
                'Bariri',
                'Conchal',
                'Espírito Santo do Pinhal',
                'Estiva Gerbi',
                'Itapira',
                'Itapuí',
                'Jaú',
                'Leme',
                'Macatuba',
                'Mogi Guaçu',
                'Mogi Mirim',
                'Pederneiras',
                'Pirassununga'
            ],
            'GO': [
                'Aparecida de Goiânia',
                'Goiânia',
            ],
            'MS': [
                'Bandeirantes',
                'Campo Grande',
                'Corguinho',
                'Jaraguari',
                'Nova Alvorada do Sul',
                'Ribas do Rio Pardo',
                'Rochedo',
                'Sidrolândia',
                'Terenos'
            ]
        },
        footer: {
            empresa: 'ABESC - Empresa Simples de Crédito',
            hideContact: true,
            copyright: '© 2026 Abesc Empresa Simples de Crédito LTDA. Todos os direitos reservados.'
        }
    },

    // ============================================
    // Cliente: Fast Money (SP, MG, PR)
    // Rota: /fast
    // ============================================
    'fast': {
        nome: 'Fast Money ESC',
        clickup: {
            listId: '901323280543',
            token: 'pk_266436457_M9444FL2XTIR2RNATHFMHXHSERGDV4N2'
        },
        estados: ['SP', 'MG', 'PR'],
        cidades: {
            'SP': [
                'Americana',
                'Araçatuba',
                'Araras',
                'Araraquara',
                'Barretos',
                'Bauru',
                'Birigui',
                'Botucatu',
                'Campinas',
                'Canitar',
                'Caraguatatuba',
                'Catanduva',
                'Chavantes',
                'Itapetininga',
                'Itu',
                'Leme',
                'Limeira',
                'Matão',
                'Ourinhos',
                'Piratininga',
                'Presidente Prudente',
                'Ribeirão do Sul',
                'Rio Claro',
                'Salto Grande',
                'Santa Cruz do Rio Pardo',
                'São Carlos',
                'São Manuel',
                'São Sebastião',
                'Sorocaba',
                'Tatuí',
                'Ubatuba',
                'Votorantim'
            ],
            'MG': [
                'Divinópolis',
                'Uberaba'
            ],
            'PR': [
                'Arapongas',
                'Cambé',
                'Londrina'
            ]
        },
        footer: {
            empresa: 'FAST MONEY - Empresa Simples de Crédito LTDA',
            hideContact: true,
            copyright: '© 2026 Fast Money Empresa Simples de Crédito LTDA. Todos os direitos reservados.'
        }
    },

    // ============================================
    // Cliente: LBR (SP, PR, SC)
    // Rota: /lbr
    // ============================================
    'lbr': {
        nome: 'LBR ESC',
        clickup: {
            listId: '901325046152',
            token: 'pk_278482325_K70UC91GM2Z75TCSO3ZKCIQ73NR70RTN'
        },
        estados: ['SP', 'PR', 'SC'],
        cidades: {
            'SP': [
                'Itanhaém',
                'Mongaguá',
                'Praia Grande',
                'Santos',
                'São Vicente'
            ],
            'PR': [
                'Curitiba',
                'Pinhais',
                'Piraquara',
                'São José dos Pinhais'
            ],
            'SC': [
                'Balneário Camboriú',
                'Bombinhas',
                'Camboriú',
                'Itajaí',
                'Itapema',
                'Navegantes',
                'Porto Belo',
                'Tijucas'
            ]
        },
        footer: {
            empresa: 'LBR ESC - Empresa Simples de Crédito',
            hideContact: true,
            copyright: '© 2026 Lbr Money Simples de Crédito LTDA. Todos os direitos reservados.'
        }
    },

    // ============================================
    // Cliente: Multicity - EG Money (SP, PR)
    // Rota: /multicity
    // ============================================
    'multicity': {
        nome: 'EG Money ESC',
        clickup: {
            listId: '901325046723',
            token: 'pk_278564902_B47NTPNDEMTPINVCVG2WXMX6JVTSJXV7'
        },
        estados: ['SP', 'PR'],
        cidades: {
            'SP': [
                'Batatais',
                'Campinas',
                'Cravinhos',
                'Elias Fausto',
                'Hortolândia',
                'Indaiatuba',
                'Itú',
                'Itupeva',
                'Jaboticabal',
                'Jardinópolis',
                'Monte Mor',
                'Nova Odessa',
                'Ribeirão Preto',
                'Salto',
                'Santa Bárbara d\'Oeste',
                'Serrana',
                'Sertãozinho',
                'Sumaré'
            ],
            'PR': [
                'Cascavel',
                'Corbélia',
                'Marechal Cândido Rondon',
                'Quedas do Iguaçu',
                'Santa Tereza do Oeste',
                'Toledo'
            ]
        },
        footer: {
            empresa: 'EG MONEY ESC - Empresa Simples de Crédito',
            hideContact: true,
            copyright: '© 2026 Eg Money Simples de Crédito LTDA. Todos os direitos reservados.'
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
    cidades: null,
    footer: {
        empresa: 'NOVA JAÚ ESC - Empresa Simples de Crédito LTDA',
        cnpj: '62.277.478/0001-10',
        email: 'pixdejau@gmail.com',
        telefone: '(14) 99865-4321',
        copyright: '© 2026 Nova Jaú Empresa Simples de Crédito LTDA. Todos os direitos reservados.'
    }
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

// ============================================
// Inicialização do Meta Pixel por Tenant
// ============================================
function initPixel() {
    const config = getClientConfig();

    if (config.pixel && typeof fbq !== 'undefined') {
        fbq('init', config.pixel);
        fbq('track', 'PageView');
        console.log(`[ESC] Meta Pixel inicializado: ${config.pixel}`);
    }
}

// Inicializa o pixel assim que o script carrega
initPixel();

// Exporta para uso global
window.ESC_CLIENTS = {
    CLIENTS,
    DEFAULT_CONFIG,
    getClientSlug,
    getClientConfig,
    isEstadoDisponivel,
    getCidadesDisponiveis
};
