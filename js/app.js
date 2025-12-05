/**
 * ESC Landing Page - Funnel Application
 * Empresa Simples de Crédito
 */

(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================
    const CONFIG = {
        webhookUrl: '', // Configure seu endpoint aqui (Zapier, Make, ClickUp, etc.)
        whatsappNumber: '5500000000000', // Número do WhatsApp com código do país
        whatsappMessage: 'Olá! Acabei de solicitar uma simulação de crédito no site.',
        storageKey: 'esc_lead_data',
        debug: true
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
            cidade_estado: '',
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

        // Populate city suggestions
        populateCitySuggestions();

        // Track page view
        trackEvent('funnel_start', { page: 1 });

        log('Funnel initialized successfully');
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
        state.data.cidade_estado = document.getElementById('cidade_estado').value.trim();

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
                cidade: state.data.cidade_estado
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
        const cidadeInput = document.getElementById('cidade_estado');

        if (nomeInput) {
            nomeInput.addEventListener('input', () => validateField('nome'));
            nomeInput.addEventListener('blur', () => validateField('nome'));
        }

        if (whatsappInput) {
            whatsappInput.addEventListener('input', (e) => {
                applyPhoneMask(e.target);
                validateField('whatsapp');
            });
            whatsappInput.addEventListener('blur', () => validateField('whatsapp'));
        }

        if (cidadeInput) {
            cidadeInput.addEventListener('input', () => validateField('cidade_estado'));
            cidadeInput.addEventListener('blur', () => validateField('cidade_estado'));
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
                if (!value) {
                    isValid = false;
                    errorMessage = 'Por favor, informe seu WhatsApp';
                } else if (cleanPhone.length < 10 || cleanPhone.length > 11) {
                    isValid = false;
                    errorMessage = 'Número de WhatsApp inválido';
                }
                break;

            case 'cidade_estado':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Por favor, informe sua cidade';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Cidade/Estado muito curto';
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
        const fields = ['nome', 'whatsapp', 'cidade_estado'];
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
    // City Suggestions
    // ============================================
    function populateCitySuggestions() {
        const datalist = document.getElementById('cidades');
        if (!datalist) return;

        const cidades = [
            'São Paulo - SP',
            'Rio de Janeiro - RJ',
            'Belo Horizonte - MG',
            'Brasília - DF',
            'Salvador - BA',
            'Fortaleza - CE',
            'Curitiba - PR',
            'Recife - PE',
            'Porto Alegre - RS',
            'Manaus - AM',
            'Goiânia - GO',
            'Belém - PA',
            'Guarulhos - SP',
            'Campinas - SP',
            'São Luís - MA',
            'São Gonçalo - RJ',
            'Maceió - AL',
            'Duque de Caxias - RJ',
            'Campo Grande - MS',
            'Natal - RN',
            'Teresina - PI',
            'São Bernardo do Campo - SP',
            'Nova Iguaçu - RJ',
            'João Pessoa - PB',
            'Santo André - SP',
            'Osasco - SP',
            'São José dos Campos - SP',
            'Ribeirão Preto - SP',
            'Jaboatão dos Guararapes - PE',
            'Uberlândia - MG',
            'Contagem - MG',
            'Sorocaba - SP',
            'Aracaju - SE',
            'Feira de Santana - BA',
            'Cuiabá - MT',
            'Joinville - SC',
            'Londrina - PR',
            'Juiz de Fora - MG',
            'Aparecida de Goiânia - GO',
            'Niterói - RJ',
            'Porto Velho - RO',
            'Ananindeua - PA',
            'Serra - ES',
            'Florianópolis - SC',
            'Caxias do Sul - RS',
            'Vitória - ES',
            'Campos dos Goytacazes - RJ',
            'Belford Roxo - RJ',
            'São João de Meriti - RJ',
            'Mauá - SP'
        ];

        cidades.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade;
            datalist.appendChild(option);
        });
    }

    // ============================================
    // Webhook Integration
    // ============================================
    async function sendToWebhook() {
        if (!CONFIG.webhookUrl) {
            log('Webhook URL not configured. Data:', state.data);
            // Return true for demo purposes
            return true;
        }

        const payload = {
            tem_cnpj: state.data.tem_cnpj,
            tem_fachada: state.data.tem_fachada,
            valor_credito: state.data.valor_credito,
            nome: state.data.nome,
            whatsapp: state.data.whatsapp,
            cidade_estado: state.data.cidade_estado,
            utm_source: state.data.utm_source || '',
            utm_medium: state.data.utm_medium || '',
            utm_campaign: state.data.utm_campaign || '',
            utm_term: state.data.utm_term || '',
            utm_content: state.data.utm_content || '',
            timestamp: state.data.timestamp,
            referrer: state.data.referrer,
            user_agent: state.data.user_agent
        };

        log('Sending to webhook:', payload);

        try {
            const response = await fetch(CONFIG.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            log('Webhook response:', response.status);
            return true;

        } catch (error) {
            log('Webhook error:', error);
            return false;
        }
    }

    // ============================================
    // Confirmation Page Updates
    // ============================================
    function updateConfirmationPage() {
        // Update displayed value
        if (elements.valorConfirmacao) {
            const valor = parseInt(state.data.valor_credito).toLocaleString('pt-BR');
            elements.valorConfirmacao.textContent = `R$ ${valor}`;
        }

        // Update WhatsApp link
        if (elements.whatsappLink) {
            const message = encodeURIComponent(
                `${CONFIG.whatsappMessage}\n\nNome: ${state.data.nome}\nValor: R$ ${state.data.valor_credito}\nCidade: ${state.data.cidade_estado}`
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
                    fbq('track', 'Lead', {
                        content_name: 'ESC Lead',
                        value: params.valor_credito,
                        currency: 'BRL'
                    });
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
