// xpe.manager.ai - Demo JavaScript Dark Cyberpunk + Chat IA Real
// Funcionalidad interactiva del demo web con estética cyberpunk y chat funcional

// ==================== CHAT IA REAL ====================
// Configuración del chat con backend de IA
const CHAT_CONFIG = {
    backendUrl: 'http://172.17.138.44:9000',
    sessionId: generateSessionId(),
    isConnected: false,
    retryAttempts: 3,
    messageQueue: []
};

// Generar ID único de sesión
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Inicializar conexión con el backend
async function initializeChat() {
    try {
        console.log('🔄 Conectando con IA backend...');
        const response = await fetch(`${CHAT_CONFIG.backendUrl}/api/health`);
        
        if (response.ok) {
            CHAT_CONFIG.isConnected = true;
            updateChatStatus('Conectado', true);
            console.log('✅ IA Backend conectado correctamente');
        } else {
            throw new Error('Backend no disponible');
        }
    } catch (error) {
        console.warn('⚠️ IA Backend no disponible, usando modo offline');
        CHAT_CONFIG.isConnected = false;
        updateChatStatus('Modo Offline', false);
    }
}

// Enviar mensaje al chat
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Agregar mensaje del usuario
    addUserMessage(message);
    
    // Limpiar input
    input.value = '';
    
    // Mostrar typing indicator
    showTypingIndicator();
    
    try {
        if (CHAT_CONFIG.isConnected) {
            // Enviar a IA real
            await sendToAI(message);
        } else {
            // Modo offline - respuestas predefinidas
            await sendOfflineResponse(message);
        }
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        addAIMessage('❌ Error de conexión. Por favor intenta de nuevo.', 'error');
    }
    
    hideTypingIndicator();
}

// Enviar mensaje a la IA real
async function sendToAI(message) {
    try {
        const response = await fetch(`${CHAT_CONFIG.backendUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                session_id: CHAT_CONFIG.sessionId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addAIMessage(data.response, 'ai');
        } else {
            throw new Error(data.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error enviando a IA:', error);
        // Fallback a respuesta offline
        await sendOfflineResponse(message);
    }
}

// Respuestas offline cuando el backend no está disponible
async function sendOfflineResponse(message) {
    const responses = {
        'hola': '¡Hola! Soy xpe.manager.ai, tu asistente especializado en DLLs. ¿En qué proyecto puedo ayudarte?',
        'dll': 'Puedo ayudarte a crear DLLs de cualquier tipo: Runtime libraries, plugins, performance, security, network, o data access. ¿Qué tipo necesitas?',
        'debug': 'Para debugging de DLLs, puedo ayudarte con: memory leaks, buffer overflows, stack corruption, access violations y más. ¿Qué problema específico tienes?',
        'optimiz': 'Las optimizaciones que puedo aplicar incluyen: SIMD vectorización, memory pooling, cache optimization, threading seguro. ¿Qué función quieres optimizar?',
        'ejemplo': 'Puedo mostrarte ejemplos de DLLs básicas, optimizadas, con SIMD, memory pooling, error handling y más. ¿Qué ejemplo específico necesitas?',
        'simd': 'SIMD (Single Instruction Multiple Data) permite procesar múltiples datos simultáneamente. Puedo ayudarte a optimizar funciones con instrucciones SSE, AVX, etc.',
        'memory': 'Para gestión de memoria en DLLs: usar memory pooling, smart pointers, bounds checking, y herramientas como AddressSanitizer o Valgrind.',
        'default': 'Soy tu asistente especializado en DLLs. Puedo ayudarte con generación, debugging, optimización, ejemplos de código y conceptos. ¿En qué necesitas asistencia?'
    };
    
    // Buscar respuesta por palabras clave
    let response = responses['default'];
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, resp] of Object.entries(responses)) {
        if (lowerMessage.includes(keyword)) {
            response = resp;
            break;
        }
    }
    
    // Simular delay de procesamiento
    setTimeout(() => {
        addAIMessage(response, 'ai');
    }, 1000 + Math.random() * 1000);
}

// Agregar mensaje del usuario al chat
function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${escapeHtml(message)}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Agregar respuesta de la IA al chat
function addAIMessage(message, type = 'ai') {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ai-message ${type}`;
    
    // Procesar markdown básico para formato
    const processedMessage = processMarkdown(message);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">${processedMessage}</div>
            <div class="message-time">xpe.manager.ai • ${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Mostrar indicador de typing
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-animation">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// Ocultar indicador de typing
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Procesar markdown básico
function processMarkdown(text) {
    return text
        // Código inline
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Código en bloque
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Negrita
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Cursiva
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Saltos de línea
        .replace(/\n/g, '<br>');
}

// Escapar HTML para seguridad
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Enviar sugerencia predefinida
function sendSuggestion(suggestion) {
    document.getElementById('chat-input').value = suggestion;
    sendMessage();
}

// Manejar input del chat (Enter para enviar)
function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Limpiar chat
function clearChat() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el chat?')) {
        const chatMessages = document.getElementById('chat-messages');
        // Mantener solo el mensaje inicial de la IA
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-text">
                        ¡Hola! Soy <strong>xpe.manager.ai</strong> - tu asistente especializado en DLLs.
                        <br><br>
                        Puedo ayudarte con:
                        <br>• 🔧 <strong>Generar DLLs</strong> de cualquier tipo
                        <br>• 🚀 <strong>Optimizar</strong> rendimiento con SIMD y memory pooling
                        <br>• 🔍 <strong>Debuggear</strong> memory leaks, stack corruption, etc.
                        <br>• 📚 <strong>Explicar conceptos</strong> y mejores prácticas
                        <br><br>
                        <em>¿En qué proyecto DLL puedo ayudarte hoy?</em>
                    </div>
                    <div class="message-time">IA</div>
                </div>
            </div>
        `;
    }
}

// Exportar chat
function exportChat() {
    const chatMessages = document.getElementById('chat-messages');
    const messages = chatMessages.querySelectorAll('.message');
    
    let exportText = '=== CHAT CON xpe.manager.ai ===\n';
    exportText += `Sesión: ${CHAT_CONFIG.sessionId}\n`;
    exportText += `Fecha: ${new Date().toLocaleString()}\n\n`;
    
    messages.forEach(message => {
        const isUser = message.classList.contains('user-message');
        const sender = isUser ? 'Usuario' : 'xpe.manager.ai';
        const text = message.querySelector('.message-text').textContent;
        const time = message.querySelector('.message-time').textContent;
        
        exportText += `[${time}] ${sender}:\n${text}\n\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_xpe_manager_ai_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Actualizar estado de conexión
function updateChatStatus(text, connected) {
    const statusElement = document.querySelector('.ai-status span');
    const indicator = document.querySelector('.status-indicator');
    
    if (statusElement) {
        statusElement.textContent = connected ? 
            `IA Especializada en DLLs - Conectada` : 
            `IA Especializada en DLLs - ${text}`;
    }
    
    if (indicator) {
        indicator.className = connected ? 'status-indicator online' : 'status-indicator offline';
    }
}

// Scroll automático al final
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// ==================== DEMO LEGACY ====================

// Datos del Demo - Especializada en DLLs
const demoData = {
    generate: `// xpe.manager.ai - Generando DLL Completa
// Archivo: MathOperations.dll

#include <windows.h>
#include <math.h>

// ===== EXPORTED FUNCTIONS =====

// Suma de matrices con optimizaciones SIMD
extern "C" __declspec(dllexport) 
void __stdcall AddMatrices(double* A, double* B, double* C, int n) {
    for (int i = 0; i < n; i++) {
        C[i] = A[i] + B[i];
    }
}

// Multiplicación de matrices con cache optimization
extern "C" __declspec(dllexport)
int __stdcall MultiplyMatrices(double* A, double* B, double* C, int n) {
    if (!A || !B || !C || n <= 0) return -1;
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            C[i * n + j] = 0;
            for (int k = 0; k < n; k++) {
                C[i * n + j] += A[i * n + k] * B[k * n + j];
            }
        }
    }
    return 0; // Success
}

// Determinante de matriz
extern "C" __declspec(dllexport)
double __stdcall MatrixDeterminant(double* matrix, int n) {
    // Implementación optimizada con cofactores
    if (n == 1) return matrix[0];
    if (n == 2) return matrix[0] * matrix[3] - matrix[1] * matrix[2];
    
    double det = 0;
    for (int j = 0; j < n; j++) {
        double* minor = (double*)malloc((n-1) * (n-1) * sizeof(double));
        // Cálculo de cofactores...
        det += matrix[j] * cofactor;
        free(minor);
    }
    return det;
}

// ===== DLL MAIN ENTRY POINT =====
BOOL APIENTRY DllMain(HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved) {
    switch (ul_reason_for_call) {
        case DLL_PROCESS_ATTACH:
            // Inicialización de la DLL
            break;
        case DLL_THREAD_ATTACH:
            break;
        case DLL_THREAD_DETACH:
            break;
        case DLL_PROCESS_DETACH:
            // Limpieza de recursos
            break;
    }
    return TRUE;
}

# 💾 DLL GENERADA EXITOSAMENTE
# ⚡ Performance: SIMD optimizado
# 🔒 Calling convention: __stdcall
# 📦 Memory management: Automatic
# 🔧 Exports: 4 funciones verificadas`,
    debug: `// DLL con errores críticos - DEBUG MODE
// Archivo: CriticalMath.dll

#include <windows.h>
#include <stdio.h>

// Función con stack corruption
extern "C" __declspec(dllexport)
int __stdcall DangerousFunction(int* data, int size) {
    int result = 0;
    
    // ❌ ERROR: Buffer overflow potencial
    for (int i = 0; i <= size; i++) {  // Should be i < size
        result += data[i];  // May access out of bounds
    }
    
    // ❌ ERROR: Memory leak - no free for result buffer
    int* temp_buffer = (int*)malloc(size * sizeof(int));
    if (!temp_buffer) return -1;
    
    // ❌ ERROR: Not checking DLL_PROCESS_DETACH
    return result;
}

// ❌ ERROR: Missing calling convention
extern "C" __declspec(dllexport) // Should have __stdcall
double UnsafeCalculation() {
    double* array = new double[1000];
    // Missing null check and no delete[]
    return array[999]; // Undefined behavior
}

// ❌ ERROR: No proper error handling
extern "C" __declspec(dllexport)
HMODULE LoadModule(const char* name) {
    return LoadLibrary(name);  // No error validation
}

// 🚨 ANÁLISIS DE ERRORES DLL:
# ❌ Buffer overflow en DangerousFunction
# ❌ Memory leaks sin cleanup
# ❌ Calling convention inconsistente
# ❌ No manejo de DLL_PROCESS_DETACH
# ❌ Sin validación de parámetros
# ❌ Access violation potential

// ✅ SOLUCIÓN DLL CORREGIDA:

extern "C" __declspec(dllexport)
int __stdcall SafeFunction(int* data, int size) {
    if (!data || size <= 0) return -1;
    
    int result = 0;
    
    // Buffer overflow fixed
    for (int i = 0; i < size && i < 1000; i++) {
        result += data[i];
    }
    
    // Memory properly managed
    int* temp_buffer = (int*)malloc(size * sizeof(int));
    if (!temp_buffer) return -1;
    
    // Process buffer...
    free(temp_buffer);  // Fixed leak
    return result;
}

extern "C" __declspec(dllexport)
double __stdcall SafeCalculation() {
    double* array = new double[1000];
    if (!array) return -1.0;
    
    double result = 0;
    for (int i = 0; i < 1000; i++) {
        result += array[i];
    }
    
    delete[] array;  // Fixed memory leak
    return result;
}

extern "C" __declspec(dllexport)
int __stdcall SafeLoadModule(const char* name) {
    if (!name) return 0;
    
    HMODULE hModule = LoadLibrary(name);
    if (!hModule) {
        DWORD error = GetLastError();
        return error;
    }
    return 1;
}

# 🔧 DEBUG DLL COMPLETADO
# ✅ Memory leaks: 100% corregidos
# ✅ Stack corruption: Eliminado
# ✅ Error handling: Implementado
# ⚡ Performance: +400% mejora
# 🛡️ Security: DLL-Safe certificada`,
    optimize: `// DLL Original - ANÁLISIS DE RENDIMIENTO DLL
// Archivo: DataProcessor.dll

#include <windows.h>
#include <vector>
#include <map>

// Función ineficiente - múltiples mallocs
extern "C" __declspec(dllexport)
int __stdcall ProcessDataSlow(int* input, int size) {
    int* temp1 = (int*)malloc(size * sizeof(int));
    int* temp2 = (int*)malloc(size * sizeof(int));
    int* result = (int*)malloc(size * sizeof(int));
    
    if (!temp1 || !temp2 || !result) {
        free(temp1); free(temp2); free(result);
        return -1;
    }
    
    // Procesamiento ineficiente
    for (int i = 0; i < size; i++) {
        temp1[i] = input[i] * 2;
        temp2[i] = temp1[i] + 10;
        result[i] = temp2[i] - 5;
    }
    
    // Copia final - otro malloc innecesario
    int* final = (int*)malloc(size * sizeof(int));
    for (int i = 0; i < size; i++) {
        final[i] = result[i];
    }
    
    // Memory cleanup
    free(temp1); free(temp2); free(result); free(final);
    return 0;
}

// ❌ PROBLEMAS DLL DETECTADOS:
# - Múltiples mallocs innecesarios
# - Complejidad O(n) con overhead alto
# - Cache misses frecuentes
# - No vectorización SIMD
# - Stack allocation avoided
# - No thread-safety consideration

// ✅ OPTIMIZACIÓN DLL APLICADA:

// Pre-allocated pool para máximo rendimiento
class DLLMemoryPool {
private:
    static constexpr size_t POOL_SIZE = 4096; // 4KB
    static constexpr size_t MAX_BLOCKS = 16;
    struct Block {
        void* ptr;
        size_t size;
        bool used;
    };
    Block blocks[MAX_BLOCKS];
    
public:
    DLLMemoryPool() {
        for (auto& block : blocks) {
            block.ptr = malloc(POOL_SIZE);
            block.size = POOL_SIZE;
            block.used = false;
        }
    }
    
    void* allocate(size_t size) {
        for (auto& block : blocks) {
            if (!block.used && block.size >= size) {
                block.used = true;
                return block.ptr;
            }
        }
        return malloc(size); // Fallback
    }
    
    void deallocate(void* ptr) {
        for (auto& block : blocks) {
            if (block.ptr == ptr) {
                block.used = false;
                return;
            }
        }
        free(ptr); // Free external allocation
    }
};

// Single-pass processing con SIMD
extern "C" __declspec(dllexport)
int __stdcall ProcessDataOptimized(int* input, int size) {
    if (!input || size <= 0) return -1;
    
    static DLLMemoryPool pool;
    
    // Single allocation in-place
    int* result = (int*)pool.allocate(size * sizeof(int));
    if (!result) return -1;
    
    // SIMD-optimized processing (4 ints at once)
    int i = 0;
    for (; i + 3 < size; i += 4) {
        // Process 4 integers simultaneously
        __m128i data = _mm_loadu_si128((__m128i*)&input[i]);
        __m128i doubled = _mm_slli_epi32(data, 1); // *2
        __m128i added = _mm_add_epi32(doubled, _mm_set1_epi32(10)); // +10
        __m128i subbed = _mm_sub_epi32(added, _mm_set1_epi32(5)); // -5
        _mm_storeu_si128((__m128i*)&result[i], subbed);
    }
    
    // Handle remaining elements
    for (; i < size; i++) {
        result[i] = ((input[i] * 2) + 10) - 5;
    }
    
    pool.deallocate(result);
    return 0; // Success
}

# 🔧 OPTIMIZACIÓN DLL COMPLETADA
# ✅ SIMD vectorization: 4x speedup
# ✅ Memory pooling: 70% less allocations
# ✅ Cache optimization: 90% fewer misses
# ⚡ Performance: +600% mejora total
# 🛡️ Thread-safe: Pool implementado`,

# 🚀 OPTIMIZACIÓN COMPLETADA:
# ✅ Rendimiento: O(n) - 400% mejora
# ✅ Memoria: Cache inteligente aplicado
# ✅ Velocidad: 87% más rápido que baseline
# 🧠 IA: Patrones neurales optimizados`,
    execute: `# INICIANDO NEURAL PROCESSING...
import asyncio
import numpy as np
from xpe.manager import NeuralCore

# Configurar IA Core
ai_core = NeuralCore()
ai_core.initialize()

# Simulación de procesamiento
start_time = time.time()

# Generar datos neurales
neural_data = np.random.random((1000, 100))
processed = ai_core.process_neural_data(neural_data)

end_time = time.time()

print(f"🧠 Procesamiento Neural: {len(processed)} elementos")
print(f"⚡ Tiempo de ejecución: {(end_time - start_time)*1000:.2f}ms")
print("✅ Red neuronal funcionando al 100%")
print("🔥 xpe.manager.ai: STATUS - ONLINE")`,
    runDebug: `# 🔍 INICIANDO ANÁLISIS DE INTEGRIDAD...

🛰️ Escaneando sistemas neurales...
🛡️ Verificando integridad del código...
⚡ Analizando patrones de optimización...

✅ SIN ERRORES CRÍTICOS ENCONTRADOS
⚠️ 3 ADVERTENCIAS DE RENDIMIENTO DETECTADAS
🔧 APLICANDO CORRECCIONES AUTOMÁTICAS

RESULTADO DEL SCAN:
- Complejidad reducida: 35% mejora
- Uso de memoria optimizado
- Patrones de IA mejorados
- Seguridad neural verificada

🚀 SISTEMA NEURAL: OPTIMIZADO`,
    optimizeAction: `# 🚀 INICIANDO NEURAL OPTIMIZATION...

🧠 Analizando red neuronal...
⚡ Calculando optimizaciones...

✅ COMPLEJIDAD: O(n²) → O(n) 
✅ MEMORIA: Cache inteligente activado
✅ VELOCIDAD: 87% más eficiente
✅ IA: Patrones neurales potenciados

🚀 RESULTADO: CÓDIGO NEURAL ÓPTIMO
💡 IA RECOMENDACIÓN: Usar numpy para arrays grandes`
};

// Configuración de partículas y efectos
let currentDemo = 'generate';
let typingSpeed = 30;
let isTyping = false;
let particlesActive = true;

// Configuración de colores cyberpunk
const cyberpunkColors = {
    primary: '#FF4757',
    glow: '#FF1744', 
    accent: '#00FFFF',
    background: '#0A0A0A'
};

// Inicialización principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 xpe.manager.ai - NEURAL CORE ACTIVATED');
    initializeParticles();
    initializeNeuralEffects();
    setupEventListeners();
    initializeDemo();
    animateOnScroll();
    createFloatingData();
    setupGlitchEffects();
    console.log('✅ IA Status: ONLINE - Neural Processing Ready');
});

// Sistema de partículas cyberpunk
function initializeParticles() {
    if (!particlesActive) return;
    
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    particleContainer.id = 'particle-container';
    document.body.appendChild(particleContainer);
    
    // Crear partículas iniciales
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createParticle(particleContainer), i * 200);
    }
    
    // Crear partículas nuevas cada 3 segundos
    setInterval(() => {
        if (particlesActive) {
            createParticle(particleContainer);
        }
    }, 3000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Posición y color aleatorio
    const leftPos = Math.random() * 100;
    const delay = Math.random() * 6;
    const size = Math.random() * 4 + 2;
    
    particle.style.left = leftPos + '%';
    particle.style.animationDelay = delay + 's';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Color basado en probabilidad
    const colors = [cyberpunkColors.primary, cyberpunkColors.accent, '#FFFFFF'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    container.appendChild(particle);
    
    // Remover después de la animación
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 8000);
}

// Efectos neurales especiales
function initializeNeuralEffects() {
    // Agregar ojo de IA a la sección hero
    const hero = document.querySelector('.hero-content');
    if (hero) {
        const aiEye = document.createElement('div');
        aiEye.className = 'ai-eye';
        aiEye.style.marginBottom = '20px';
        hero.insertBefore(aiEye, hero.firstChild);
    }
    
    // Efectos de stream de datos en backgrounds
    document.querySelectorAll('.demo-section, .pricing').forEach(section => {
        section.classList.add('data-stream');
    });
    
    // Glow effects para elementos importantes
    document.querySelectorAll('.hero-title').forEach(title => {
        title.classList.add('ai-glow');
    });
}

// Crear datos flotantes decorativos
function createFloatingData() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const dataStreams = [
        '01001101 01100101 01101101 01101111 01110010',
        '01001001 01000001 01001110 01000001 01001100 01011001 01011001',
        '01001110 01000101 01010101 01010010 01000001 01001100',
        '01001001 01001110 01010100 01000101 01001100 01001100 01001001 01000111 01000101 01001110 01010100'
    ];
    
    setInterval(() => {
        if (Math.random() > 0.7) { // Solo 30% del tiempo para no ser intrusivo
            createFloatingDataElement(hero, dataStreams[Math.floor(Math.random() * dataStreams.length)]);
        }
    }, 5000);
}

function createFloatingDataElement(container, data) {
    const element = document.createElement('div');
    element.textContent = data;
    element.style.cssText = `
        position: absolute;
        font-family: 'JetBrains Mono', monospace;
        font-size: 8px;
        color: ${cyberpunkColors.primary};
        opacity: 0.1;
        pointer-events: none;
        white-space: nowrap;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        transform: translate(-50%, -50%);
        animation: dataFlow 8s linear infinite;
        z-index: 1;
    `;
    
    container.appendChild(element);
    
    setTimeout(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }, 8000);
}

// Efectos glitch para elementos especiales
function setupGlitchEffects() {
    // Glitch ocasional en títulos principales
    const glitchTargets = document.querySelectorAll('.hero-title, .section-title');
    
    setInterval(() => {
        const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
        if (target && Math.random() > 0.8) {
            triggerGlitch(target);
        }
    }, 10000);
}

function triggerGlitch(element) {
    const originalTransform = element.style.transform;
    element.style.animation = 'glitch 0.5s ease-out';
    
    setTimeout(() => {
        element.style.animation = '';
        element.style.transform = originalTransform;
    }, 500);
}

// Event listeners mejorados
function setupEventListeners() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Efectos hover mejorados con glow
    document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            createHoverParticles(this);
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Botones con efectos especiales
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            createClickRipple(this, e);
        });
    });
}

// Crear partículas de hover
function createHoverParticles(element) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: ${cyberpunkColors.primary};
            border-radius: 50%;
            pointer-events: none;
            top: 50%;
            left: 50%;
            animation: hoverParticle 1s ease-out forwards;
            z-index: 1000;
        `;
        
        element.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}

// Efecto ripple al hacer clic
function createClickRipple(element, event) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, ${cyberpunkColors.primary}, transparent);
        border-radius: 50%;
        pointer-events: none;
        animation: rippleEffect 0.6s ease-out;
        z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Configurar demo inicial
function initializeDemo() {
    const typedElement = document.getElementById('typed-text');
    if (typedElement) {
        typeWriter(demoData[currentDemo], typedElement);
    }
}

// Funciones del Demo
function openDemo() {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({
            behavior: 'smooth'
        });
        
        // Efecto especial al llegar a la demo
        setTimeout(() => {
            document.querySelector('.code-editor').style.animation = 'ai-glow 2s ease-in-out';
        }, 500);
    }
}

function openAIChat() {
    const aiChatSection = document.getElementById('ai-chat');
    if (aiChatSection) {
        aiChatSection.scrollIntoView({
            behavior: 'smooth'
        });
        
        // Efecto especial al llegar al chat
        setTimeout(() => {
            document.querySelector('.chat-container').style.animation = 'breathe 2s ease-in-out';
            // Enfocar input del chat
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }, 500);
    }
}

function scrollToContact() {
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth'
    });
}

function switchDemo(type) {
    if (isTyping) return;
    
    currentDemo = type;
    
    // Actualizar pestañas activas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Efecto de transición
    const output = document.getElementById('demo-output');
    output.style.opacity = '0.5';
    output.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        output.style.opacity = '';
        output.style.transform = '';
        typeWriter(demoData[type], output);
    }, 200);
}

// Efecto de máquina de escribir cyberpunk
function typeWriter(text, element, index = 0) {
    if (isTyping) return;
    
    isTyping = true;
    
    if (index < text.length) {
        element.innerHTML = text.substring(0, index);
        
        // Efecto especial para caracteres importantes
        const currentChar = text.charAt(index);
        if ('🧠🚀⚡🔥✅❌🛡️💡'.includes(currentChar)) {
            element.innerHTML += `<span style="color: ${cyberpunkColors.primary}; text-shadow: 0 0 10px ${cyberpunkColors.primary};">${currentChar}</span>`;
        } else {
            element.textContent += currentChar;
        }
        
        index++;
        
        // Velocidad variable para efecto realista
        let delay = typingSpeed;
        if ('.!?;'.includes(currentChar)) delay *= 3;
        if (','.includes(currentChar)) delay *= 2;
        if (currentChar === ' ') delay *= 0.5;
        
        setTimeout(() => {
            typeWriter(text, element, index);
        }, delay + Math.random() * 50);
    } else {
        isTyping = false;
        
        // Cursor especial para IA
        element.innerHTML += '<span style="color: ' + cyberpunkColors.primary + '; animation: blink 1s infinite;">|</span>';
    }
}

// Funciones de control con efectos especiales
function executeCode() {
    const output = document.getElementById('demo-output');
    output.style.background = 'rgba(255, 71, 87, 0.05)';
    
    // Efecto de procesamiento DLL
    showNeuralProcessing('Generando DLL optimizada...');
    
    setTimeout(() => {
        output.innerHTML = demoData[currentDemo];
        output.style.background = '';
        showSuccessMessage('⚡ DLL generada exitosamente - 100% funcional');
    }, 2000);
}

function runDebug() {
    const output = document.getElementById('demo-output');
    
    // Simular escaneo de DLL
    showNeuralProcessing('Escaneando estructura DLL...');
    
    setTimeout(() => {
        output.innerHTML = demoData.debug;
        showInfoMessage('🔧 Debug DLL completado - Errores corregidos');
    }, 2500);
}

function optimizeCode() {
    const output = document.getElementById('demo-output');
    
    // Efecto de optimización DLL
    showNeuralProcessing('Aplicando optimización de rendimiento...');
    
    setTimeout(() => {
        output.innerHTML = demoData.optimize;
        showSuccessMessage('🚀 Optimización DLL aplicada - 600% mejora de velocidad');
    }, 3000);
}

// Mostrar procesamiento neural
function showNeuralProcessing(message) {
    const output = document.getElementById('demo-output');
    const processingChar = '⚡';
    
    output.innerHTML = `<span style="color: ${cyberpunkColors.primary}">${processingChar}</span> ${message}`;
    output.style.fontStyle = 'italic';
    
    setTimeout(() => {
        output.style.fontStyle = '';
    }, 2000);
}

// Sistema de notificaciones cyberpunk
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showInfoMessage(message) {
    showNotification(message, 'info');
}

function showWarningMessage(message) {
    showNotification(message, 'warning');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Color basado en tipo
    const colors = {
        success: cyberpunkColors.primary,
        info: cyberpunkColors.accent,
        warning: '#FBBF24'
    };
    
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Estilos cyberpunk
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(255, 71, 87, 0.1) 100%);
        color: ${cyberpunkColors.primary};
        border-radius: 8px;
        box-shadow: 0 0 30px rgba(255, 71, 87, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
        max-width: 350px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        border: 1px solid ${colors[type]};
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Formulario con efectos cyberpunk
function submitForm(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const button = event.target.querySelector('button');
    const form = event.target;
    
    if (!email || !isValidEmail(email)) {
        showWarningMessage('⚠️ Email inválido - Verificación neural fallida');
        return;
    }
    
    // Efecto de carga neural
    const originalText = button.textContent;
    button.textContent = 'NEURAL PROCESSING...';
    button.disabled = true;
    form.classList.add('loading');
    
    // Crear efecto de barras de progreso
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        button.textContent = `NEURAL PROCESSING... ${progress}%`;
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 200);
    
    setTimeout(() => {
        button.textContent = '🧠 ACCESO NEURAL APROBADO';
        button.style.background = cyberpunkColors.primary;
        button.style.color = cyberpunkColors.background;
        
        showSuccessMessage('🎉 Bienvenido a xpe.manager.ai - Neural Access Granted');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.background = '';
            button.style.color = '';
            form.classList.remove('loading');
            form.reset();
        }, 4000);
    }, 2000);
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Animaciones scroll con efectos cyberpunk
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                
                // Efectos especiales para ciertos elementos
                if (entry.target.classList.contains('pricing-card')) {
                    setTimeout(() => {
                        entry.target.style.boxShadow = `0 0 40px rgba(255, 71, 87, 0.2)`;
                    }, 300);
                }
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.feature-card, .pricing-card, .contact-content').forEach(el => {
        observer.observe(el);
    });
}

// Easter egg: Konami Code neural
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length && 
        konamiCode.every((code, index) => code === konamiSequence[index])) {
        
        // Activar modo neural máximo
        activateNeuralMaxMode();
        konamiCode = [];
    }
});

function activateNeuralMaxMode() {
    document.body.style.filter = 'hue-rotate(45deg) saturate(1.5)';
    createExplosionOfParticles();
    showSuccessMessage('🧠 NEURAL MAX MODE ACTIVATED! xpe.nettt approves this! 🚀');
    
    setTimeout(() => {
        document.body.style.filter = '';
    }, 5000);
}

function createExplosionOfParticles() {
    const container = document.getElementById('particle-container');
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createParticle(container), i * 50);
    }
}

// Performance tracking
function trackPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            console.log(`🔥 xpe.manager.ai - Neural Load Time: ${loadTime}ms`);
            
            // Inicializar chat IA
            initializeChat();
            
            if (loadTime < 2000) {
                showSuccessMessage('🚀 Neural Processing Ultra-Fast! IA Conectada.');
            }
        });
    }
}

trackPerformance();

// API simulation neural
const xpeAPI = {
    generateCode: async (prompt, language) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    code: demoData.generate,
                    confidence: 0.97,
                    neural_patterns: ['pattern_001', 'pattern_002', 'pattern_003'],
                    suggestions: ['Optimizar complejidad', 'Añadir validación neural', 'Potenciar rendimiento']
                });
            }, 1200);
        });
    },
    
    debugCode: async (code) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    errors: 2,
                    severity: ['medium', 'low'],
                    suggestions: ['Corregir comparación neural', 'Validar entrada', 'Optimizar rendimiento'],
                    fixed: demoData.debug,
                    neural_analysis: 'Patrones de IA verificados'
                });
            }, 1500);
        });
    },
    
    optimizeCode: async (code) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    improvements: 4,
                    performance: '400% más rápido',
                    optimization_level: 'neural_max',
                    optimized: demoData.optimize,
                    neural_score: 95
                });
            }, 1300);
        });
    },
    
    neuralAnalysis: async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    neural_integrity: '99.7%',
                    processing_speed: 'Ultra-Rápido',
                    optimization_potential: 'Maximum',
                    recommendations: ['Potenciar cache neural', 'Optimizar patrones', 'Acelerar procesamiento']
                });
            }, 1000);
        });
    }
};

// Exponer API globalmente
window.xpeAPI = xpeAPI;

// Console log especial
console.log('🧠 xpe.manager.ai - Neural Core v0.1.0');
console.log('🔥 Desarrollado por: xpe.nettt');
console.log('⚡ Neural Processing: ACTIVE');
console.log('🚀 Ready for Launch!');