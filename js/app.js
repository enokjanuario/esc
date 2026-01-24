/**
 * ESC Landing Page - Funnel Application
 * Empresa Simples de Crédito
 */

(function() {
    'use strict';

    // ============================================
    // Client Configuration (Multi-tenancy)
    // ============================================
    const CLIENT_CONFIG = window.ESC_CLIENTS ? window.ESC_CLIENTS.getClientConfig() : null;

    // ============================================
    // Configuration
    // ============================================
    const CONFIG = {
        // API Endpoint - mudar para '/api/clickup' se usar Vercel
        apiEndpoint: '/api/clickup.php',

        // WhatsApp
        whatsappNumber: '5500000000000', // Número do WhatsApp com código do país
        whatsappMessage: 'Olá! Acabei de solicitar uma simulação de crédito no site.',

        // ClickUp (pode ser sobrescrito pelo CLIENT_CONFIG)
        clickupListId: CLIENT_CONFIG?.clickup?.listId || '901323227565',
        clickupToken: CLIENT_CONFIG?.clickup?.token || null,

        // Outros
        storageKey: 'esc_lead_data',
        debug: false
    };

    // ============================================
    // State Management
    // ============================================
    const state = {
        currentPage: 1,
        totalPages: 5,
        data: {
            tem_cnpj: '',
            tem_fachada: '',
            valor_credito: '',
            nome: '',
            whatsapp: '',
            estado: '',
            cidade: '',
            utm_source: '',
            utm_medium: '',
            utm_campaign: '',
            utm_term: '',
            utm_content: '',
            timestamp: '',
            user_agent: '',
            referrer: ''
        }
    };

    // ============================================
    // DOM Elements
    // ============================================
    const elements = {
        progressBar: document.getElementById('progressBar'),
        progressSteps: document.querySelectorAll('.progress-steps .step'),
        pages: document.querySelectorAll('.funnel-page'),
        rejectionMessage: document.getElementById('rejectionMessage'),
        leadForm: document.getElementById('leadForm'),
        submitBtn: document.getElementById('submitBtn'),
        valorConfirmacao: document.getElementById('valorConfirmacao'),
        whatsappLink: document.getElementById('whatsappLink')
    };

    // ============================================
    // Initialization
    // ============================================
    function init() {
        log('Initializing ESC Funnel...');

        // Capture UTM parameters
        captureUTMParams();

        // Capture additional metadata
        captureMetadata();

        // Load saved data from localStorage
        loadSavedData();

        // Setup event listeners
        setupEventListeners();

        // Setup form validation
        setupFormValidation();

        // Populate estados e cidades
        populateEstados();

        // Update footer based on client config
        updateFooter();

        // Track page view
        trackEvent('funnel_start', { page: 1 });

        log('Funnel initialized successfully');
    }

    // ============================================
    // Dynamic Footer
    // ============================================
    function updateFooter() {
        if (!CLIENT_CONFIG || !CLIENT_CONFIG.footer) return;

        const footer = CLIENT_CONFIG.footer;

        // Update company name
        const footerName = document.querySelector('.footer-name');
        if (footerName && footer.empresa) {
            const empresaParts = footer.empresa.split(' - ');
            footerName.textContent = empresaParts[0];
        }

        // Update razão social
        const footerRazao = document.querySelector('.footer-razao');
        if (footerRazao && footer.empresa) {
            const empresaParts = footer.empresa.split(' - ');
            footerRazao.textContent = empresaParts[1] || 'Empresa Simples de Crédito LTDA';
        }

        // Handle contact section
        const footerContact = document.querySelector('.footer-contact');
        if (footerContact && footer.hideContact) {
            footerContact.style.display = 'none';
        } else if (footerContact) {
            // Update email
            const footerEmail = footerContact.querySelector('a[href^="mailto:"]');
            if (footerEmail && footer.email) {
                footerEmail.href = `mailto:${footer.email}`;
                footerEmail.textContent = footer.email;
            }

            // Update phone
            const footerPhone = footerContact.querySelector('a[href^="tel:"]');
            if (footerPhone && footer.telefone) {
                const phoneClean = footer.telefone.replace(/\D/g, '');
                footerPhone.href = `tel:+55${phoneClean}`;
                footerPhone.textContent = footer.telefone;
            }
        }

        // Update copyright
        const footerLegal = document.querySelector('.footer-legal p:first-child');
        if (footerLegal && footer.copyright) {
            footerLegal.textContent = footer.copyright;
        }

        log('Footer updated for client:', CLIENT_CONFIG.nome);
    }

    // ============================================
    // UTM & Metadata Capture
    // ============================================
    function captureUTMParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

        utmParams.forEach(param => {
            const value = urlParams.get(param);
            if (value) {
                state.data[param] = value;
            }
        });

        log('UTM params captured:', state.data);
    }

    function captureMetadata() {
        state.data.user_agent = navigator.userAgent;
        state.data.referrer = document.referrer || 'direct';
        state.data.timestamp = new Date().toISOString();
    }

    // ============================================
    // LocalStorage Management
    // ============================================
    function saveData() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.data));
            log('Data saved to localStorage');
        } catch (e) {
            log('Error saving to localStorage:', e);
        }
    }

    function loadSavedData() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Only restore if not completed
                if (!parsed.completed) {
                    Object.assign(state.data, parsed);
                    log('Data loaded from localStorage');
                }
            }
        } catch (e) {
            log('Error loading from localStorage:', e);
        }
    }

    function clearSavedData() {
        try {
            localStorage.removeItem(CONFIG.storageKey);
            log('localStorage cleared');
        } catch (e) {
            log('Error clearing localStorage:', e);
        }
    }

    // ============================================
    // Event Listeners
    // ============================================
    function setupEventListeners() {
        // CTA buttons (Pages 1-2) - Primary and Secondary
        document.querySelectorAll('.cta-primary, .cta-secondary').forEach(btn => {
            btn.addEventListener('click', handleOptionClick);
        });

        // Value cards (Page 3)
        document.querySelectorAll('.value-card').forEach(card => {
            card.addEventListener('click', handleValueCardClick);
        });

        // Form submission (Page 4)
        if (elements.leadForm) {
            elements.leadForm.addEventListener('submit', handleFormSubmit);
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyDown);
    }

    function handleOptionClick(e) {
        const btn = e.currentTarget;
        const value = btn.dataset.value;
        const action = btn.dataset.action;
        const nextPage = parseInt(btn.dataset.next);

        // Handle rejection
        if (action === 'reject') {
            showRejection();
            trackEvent('lead_rejected', { reason: 'no_cnpj' });
            return;
        }

        // Save response based on current page
        if (state.currentPage === 1) {
            state.data.tem_cnpj = value;
        } else if (state.currentPage === 2) {
            state.data.tem_fachada = value;
        }

        saveData();

        // Add selection animation
        btn.classList.add('selected');

        // Navigate to next page
        setTimeout(() => {
            goToPage(nextPage);
        }, 200);

        trackEvent('option_selected', {
            page: state.currentPage,
            value: value
        });
    }

    function handleValueCardClick(e) {
        const card = e.currentTarget;
        const value = card.dataset.value;
        const nextPage = parseInt(card.dataset.next);

        // Save selected value
        state.data.valor_credito = value;
        saveData();

        // Add selection animation
        document.querySelectorAll('.value-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Navigate to next page
        setTimeout(() => {
            goToPage(nextPage);
        }, 200);

        trackEvent('value_selected', { value: value });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Get form values
        state.data.nome = document.getElementById('nome').value.trim();
        state.data.whatsapp = document.getElementById('whatsapp').value.trim();
        state.data.estado = document.getElementById('estado').value;
        state.data.cidade = document.getElementById('cidade').value;

        saveData();

        // Show loading state
        setLoading(true);

        // Send to webhook
        const success = await sendToWebhook();

        setLoading(false);

        if (success) {
            // Mark as completed
            state.data.completed = true;
            saveData();

            // Update confirmation page
            updateConfirmationPage();

            // Navigate to confirmation
            goToPage(5);

            trackEvent('lead_converted', {
                valor_credito: state.data.valor_credito,
                estado: state.data.estado,
                cidade: state.data.cidade
            });

            // Clear data after short delay
            setTimeout(clearSavedData, 2000);
        } else {
            alert('Ocorreu um erro. Por favor, tente novamente.');
            trackEvent('submission_error');
        }
    }

    function handleKeyDown(e) {
        // Allow Enter to trigger focused button
        if (e.key === 'Enter' && (
            document.activeElement.classList.contains('cta-primary') ||
            document.activeElement.classList.contains('cta-secondary') ||
            document.activeElement.classList.contains('value-card')
        )) {
            document.activeElement.click();
        }
    }

    // ============================================
    // Page Navigation
    // ============================================
    const stepDescriptions = {
        1: 'Sobre seu negócio',
        2: 'Qualificação',
        3: 'Valor do crédito',
        4: 'Seus dados',
        5: 'Confirmação'
    };

    function goToPage(pageNum) {
        if (pageNum < 1 || pageNum > state.totalPages) return;

        const currentPageEl = document.getElementById(`page${state.currentPage}`);
        const nextPageEl = document.getElementById(`page${pageNum}`);

        if (!currentPageEl || !nextPageEl) return;

        // Animate out current page
        currentPageEl.classList.add('exit');
        currentPageEl.classList.remove('active');

        // Animate in next page
        setTimeout(() => {
            currentPageEl.classList.remove('exit');
            nextPageEl.classList.add('active');

            // Update state
            state.currentPage = pageNum;

            // Update progress
            updateProgress();

            // Focus first interactive element
            focusFirstElement(nextPageEl);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        }, 300);

        trackEvent('page_view', { page: pageNum });
    }

    function updateProgress() {
        const progress = (state.currentPage / state.totalPages) * 100;
        elements.progressBar.style.width = `${progress}%`;

        // Update step indicators
        elements.progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNum === state.currentPage) {
                step.classList.add('active');
            } else if (stepNum < state.currentPage) {
                step.classList.add('completed');
            }
        });

        // Update progress info text
        const stepLabel = document.querySelector('.progress-step-label');
        const stepDescription = document.querySelector('.progress-step-description');

        if (stepLabel) {
            stepLabel.innerHTML = `Etapa <strong>${state.currentPage}</strong> de ${state.totalPages} `;
        }
        if (stepDescription) {
            stepDescription.textContent = stepDescriptions[state.currentPage] || '';
        }
    }

    function focusFirstElement(page) {
        const focusable = page.querySelector('button, input, select, textarea');
        if (focusable) {
            setTimeout(() => focusable.focus(), 400);
        }
    }

    // ============================================
    // Rejection Modal
    // ============================================
    function showRejection() {
        elements.rejectionMessage.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Global function for onclick
    window.hideRejection = function() {
        elements.rejectionMessage.classList.remove('show');
        document.body.style.overflow = '';
    };

    // ============================================
    // Form Validation
    // ============================================
    function setupFormValidation() {
        const nomeInput = document.getElementById('nome');
        const whatsappInput = document.getElementById('whatsapp');
        const whatsappConfirmInput = document.getElementById('whatsappConfirm');
        const estadoSelect = document.getElementById('estado');
        const cidadeSelect = document.getElementById('cidade');

        if (nomeInput) {
            nomeInput.addEventListener('input', () => validateField('nome'));
            nomeInput.addEventListener('blur', () => validateField('nome'));
        }

        if (whatsappInput) {
            whatsappInput.addEventListener('input', (e) => {
                applyPhoneMask(e.target);
                validateField('whatsapp');
                // Revalidar confirmação se já tiver valor
                if (whatsappConfirmInput && whatsappConfirmInput.value) {
                    validateField('whatsappConfirm');
                }
            });
            whatsappInput.addEventListener('blur', () => validateField('whatsapp'));
        }

        if (whatsappConfirmInput) {
            whatsappConfirmInput.addEventListener('input', (e) => {
                applyPhoneMask(e.target);
                validateField('whatsappConfirm');
            });
            whatsappConfirmInput.addEventListener('blur', () => validateField('whatsappConfirm'));
        }

        if (estadoSelect) {
            estadoSelect.addEventListener('change', () => validateField('estado'));
        }

        if (cidadeSelect) {
            cidadeSelect.addEventListener('change', () => validateField('cidade'));
        }
    }

    function validateField(fieldName) {
        const input = document.getElementById(fieldName);
        const errorEl = document.getElementById(`${fieldName}Error`);
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'nome':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Por favor, informe seu nome';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Nome muito curto';
                } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Nome deve conter apenas letras';
                } else if (value.split(' ').length < 2) {
                    isValid = false;
                    errorMessage = 'Por favor, informe nome e sobrenome';
                }
                break;

            case 'whatsapp':
                const cleanPhone = value.replace(/\D/g, '');
                const ddd = cleanPhone.slice(0, 2);
                const numeroSemDDD = cleanPhone.slice(2);
                const dddsValidos = ['11','12','13','14','15','16','17','18','19','21','22','24','27','28','31','32','33','34','35','37','38','41','42','43','44','45','46','47','48','49','51','53','54','55','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99'];

                // Verifica se todos os dígitos são iguais
                const todosIguais = /^(\d)\1+$/.test(numeroSemDDD);

                // Verifica sequências crescentes ou decrescentes
                const sequenciaCrescente = '0123456789';
                const sequenciaDecrescente = '9876543210';
                const ehSequencia = sequenciaCrescente.includes(numeroSemDDD) || sequenciaDecrescente.includes(numeroSemDDD);

                if (!value) {
                    isValid = false;
                    errorMessage = 'Por favor, informe seu WhatsApp';
                } else if (cleanPhone.length < 11) {
                    isValid = false;
                    errorMessage = 'Número incompleto - deve ter DDD + 9 dígitos';
                } else if (cleanPhone.length > 11) {
                    isValid = false;
                    errorMessage = 'Número com dígitos a mais';
                } else if (!dddsValidos.includes(ddd)) {
                    isValid = false;
                    errorMessage = `DDD (${ddd}) inválido - verifique o código de área`;
                } else if (todosIguais) {
                    isValid = false;
                    errorMessage = 'Número inválido - dígitos não podem ser todos iguais';
                } else if (ehSequencia) {
                    isValid = false;
                    errorMessage = 'Número inválido - não pode ser sequência';
                }
                break;

            case 'whatsappConfirm':
                const cleanPhoneConfirm = value.replace(/\D/g, '');
                const whatsappOriginal = document.getElementById('whatsapp')?.value.trim() || '';
                const cleanOriginal = whatsappOriginal.replace(/\D/g, '');

                if (!value) {
                    isValid = false;
                    errorMessage = 'Por favor, confirme seu WhatsApp';
                } else if (cleanPhoneConfirm.length < 11) {
                    isValid = false;
                    errorMessage = 'Número incompleto';
                } else if (cleanPhoneConfirm.length > 11) {
                    isValid = false;
                    errorMessage = 'Número com dígitos a mais';
                } else if (cleanOriginal.length >= 11 && cleanPhoneConfirm !== cleanOriginal) {
                    isValid = false;
                    errorMessage = 'Os números não coincidem';
                }
                break;

            case 'estado':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Por favor, selecione o estado';
                }
                break;

            case 'cidade':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Por favor, selecione a cidade';
                }
                break;
        }

        // Update UI
        input.classList.remove('error', 'valid');
        input.classList.add(isValid ? 'valid' : 'error');
        if (errorEl) {
            errorEl.textContent = errorMessage;
        }

        return isValid;
    }

    function validateForm() {
        const fields = ['nome', 'whatsapp', 'whatsappConfirm', 'estado', 'cidade'];
        let isValid = true;

        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // ============================================
    // Phone Mask
    // ============================================
    function applyPhoneMask(input) {
        let value = input.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.length > 0) {
            // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length <= 10) {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
            } else {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
        }

        input.value = value;
    }

    // ============================================
    // Estados do Brasil
    // ============================================
    const estados = [
        { sigla: 'AC', nome: 'Acre' },
        { sigla: 'AL', nome: 'Alagoas' },
        { sigla: 'AP', nome: 'Amapá' },
        { sigla: 'AM', nome: 'Amazonas' },
        { sigla: 'BA', nome: 'Bahia' },
        { sigla: 'CE', nome: 'Ceará' },
        { sigla: 'DF', nome: 'Distrito Federal' },
        { sigla: 'ES', nome: 'Espírito Santo' },
        { sigla: 'GO', nome: 'Goiás' },
        { sigla: 'MA', nome: 'Maranhão' },
        { sigla: 'MT', nome: 'Mato Grosso' },
        { sigla: 'MS', nome: 'Mato Grosso do Sul' },
        { sigla: 'MG', nome: 'Minas Gerais' },
        { sigla: 'PA', nome: 'Pará' },
        { sigla: 'PB', nome: 'Paraíba' },
        { sigla: 'PR', nome: 'Paraná' },
        { sigla: 'PE', nome: 'Pernambuco' },
        { sigla: 'PI', nome: 'Piauí' },
        { sigla: 'RJ', nome: 'Rio de Janeiro' },
        { sigla: 'RN', nome: 'Rio Grande do Norte' },
        { sigla: 'RS', nome: 'Rio Grande do Sul' },
        { sigla: 'RO', nome: 'Rondônia' },
        { sigla: 'RR', nome: 'Roraima' },
        { sigla: 'SC', nome: 'Santa Catarina' },
        { sigla: 'SP', nome: 'São Paulo' },
        { sigla: 'SE', nome: 'Sergipe' },
        { sigla: 'TO', nome: 'Tocantins' }
    ];

    function populateEstados() {
        const estadoSelect = document.getElementById('estado');
        const cidadeSelect = document.getElementById('cidade');

        if (!estadoSelect) return;

        // Verificar se há configuração de cliente
        const hasClientConfig = CLIENT_CONFIG && CLIENT_CONFIG.estados;

        // Popular estados (filtrados se houver config de cliente)
        estados.forEach(estado => {
            // Se há config de cliente, só mostra estados permitidos
            if (hasClientConfig && !CLIENT_CONFIG.estados.includes(estado.sigla)) {
                return;
            }

            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = `${estado.nome} (${estado.sigla})`;
            estadoSelect.appendChild(option);
        });

        // Função para carregar cidades
        async function carregarCidades(sigla) {
            cidadeSelect.innerHTML = '<option value="">Carregando...</option>';
            cidadeSelect.disabled = true;

            if (!sigla) {
                cidadeSelect.innerHTML = '<option value="">Selecione...</option>';
                return;
            }

            // Verificar se o cliente tem cidades específicas configuradas
            const cidadesConfiguradas = CLIENT_CONFIG?.cidades?.[sigla];

            if (cidadesConfiguradas && cidadesConfiguradas.length > 0) {
                // Usar cidades da configuração do cliente
                cidadeSelect.innerHTML = '<option value="">Selecione...</option>';

                cidadesConfiguradas.sort().forEach(cidade => {
                    const option = document.createElement('option');
                    option.value = cidade;
                    option.textContent = cidade;
                    cidadeSelect.appendChild(option);
                });

                cidadeSelect.disabled = false;
                log(`${cidadesConfiguradas.length} cidades carregadas da config para ${sigla}`);

            } else {
                // Buscar cidades da API do IBGE (fallback)
                try {
                    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios?orderBy=nome`);
                    const cidades = await response.json();

                    cidadeSelect.innerHTML = '<option value="">Selecione...</option>';

                    cidades.forEach(cidade => {
                        const option = document.createElement('option');
                        option.value = cidade.nome;
                        option.textContent = cidade.nome;
                        cidadeSelect.appendChild(option);
                    });

                    cidadeSelect.disabled = false;
                    log(`${cidades.length} cidades carregadas da API IBGE para ${sigla}`);

                } catch (error) {
                    log('Erro ao carregar cidades:', error);
                    cidadeSelect.innerHTML = '<option value="">Erro ao carregar</option>';
                }
            }
        }

        // Listener para quando estado mudar
        estadoSelect.addEventListener('change', function() {
            carregarCidades(this.value);
        });

        // Se só tem um estado disponível, seleciona e carrega cidades automaticamente
        if (hasClientConfig && CLIENT_CONFIG.estados.length === 1) {
            estadoSelect.value = CLIENT_CONFIG.estados[0];
            carregarCidades(CLIENT_CONFIG.estados[0]);
        }
    }

    // ============================================
    // ClickUp Integration (via Vercel API)
    // ============================================
    async function sendToWebhook() {
        return await sendToClickUp();
    }

    // Enviar para API serverless que faz proxy para o ClickUp
    async function sendToClickUp() {
        const payload = {
            nome: state.data.nome,
            whatsapp: state.data.whatsapp,
            estado: state.data.estado,
            cidade: state.data.cidade,
            tem_cnpj: state.data.tem_cnpj,
            tem_fachada: state.data.tem_fachada,
            valor_credito: state.data.valor_credito,
            utm_source: state.data.utm_source || '',
            utm_medium: state.data.utm_medium || '',
            utm_campaign: state.data.utm_campaign || '',
            referrer: state.data.referrer || '',
            // Multi-tenancy: envia info do cliente
            cliente: CLIENT_CONFIG?.slug || 'default',
            clickup_list_id: CONFIG.clickupListId,
            clickup_token: CONFIG.clickupToken
        };

        log('Enviando para ClickUp via API:', payload);

        try {
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao enviar dados');
            }

            log('ClickUp task criada:', result);
            return true;

        } catch (error) {
            log('Erro ao enviar para ClickUp:', error);
            return false;
        }
    }

    // ============================================
    // Confirmation Page Updates
    // ============================================
    function updateConfirmationPage() {
        // Update displayed value
        if (elements.valorConfirmacao) {
            const valor = parseInt(state.data.valor_credito).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            elements.valorConfirmacao.textContent = `R$${valor}`;
        }

        // Update WhatsApp link (mantido para compatibilidade futura)
        if (elements.whatsappLink) {
            const message = encodeURIComponent(
                `${CONFIG.whatsappMessage}\n\nNome: ${state.data.nome}\nValor: R$ ${state.data.valor_credito}\nCidade: ${state.data.cidade} - ${state.data.estado}`
            );
            elements.whatsappLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
        }
    }

    // ============================================
    // Loading State
    // ============================================
    function setLoading(isLoading) {
        if (elements.submitBtn) {
            elements.submitBtn.disabled = isLoading;
            elements.submitBtn.classList.toggle('loading', isLoading);
        }
    }

    // ============================================
    // Analytics & Tracking
    // ============================================
    function trackEvent(eventName, params = {}) {
        // DataLayer for GTM
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: eventName,
                ...params
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            switch (eventName) {
                case 'funnel_start':
                    fbq('track', 'ViewContent', { content_name: 'Funnel Start' });
                    break;
                case 'lead_converted':
                    fbq('track', 'Lead');
                    fbq('track', 'Purchase');
                    break;
                case 'page_view':
                    fbq('track', 'PageView');
                    break;
            }
        }

        log(`Event tracked: ${eventName}`, params);
    }

    // ============================================
    // Utility Functions
    // ============================================
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[ESC Funnel]', ...args);
        }
    }

    // ============================================
    // Initialize on DOM Ready
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
