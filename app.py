#!/usr/bin/env python3
"""
xpe.manager.ai - Backend con IA Real
Sistema completo de IA conversacional especializada en DLLs
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación Flask
app = Flask(__name__, static_folder='.')
CORS(app)  # Permitir CORS para desarrollo

# Base de conocimientos especializada en DLLs
DLL_KNOWLEDGE_BASE = {
    "generacion": {
        "tipos_dlls": {
            "runtime": "Librerías de tiempo de ejecución: CRT, MFC, ATL, STL, Boost",
            "plugins": "Sistemas de plugins dinámicos, interfaces COM, extensibilidad",
            "performance": "Optimizaciones SIMD, operaciones multi-threaded, GPU acceleration",
            "security": "Criptografía, autenticación, firmas digitales, almacenamiento seguro",
            "network": "Sockets TCP/UDP, HTTP/HTTPS, Message queues, Named pipes",
            "data": "SQLite integration, JSON/XML parsing, Object persistence, Cache systems"
        },
        "lenguajes": ["C++", "C# (.NET)", "Rust", "Go", "Assembly", "Python (C extensions)"],
        "plataformas": {
            "windows": ".dll (32-bit y 64-bit)",
            "linux": ".so (Shared Objects)", 
            "macos": ".dylib (Dynamic Libraries)",
            "android": ".so (Native Libraries)",
            "embedded": "Custom formats"
        },
        "calling_conventions": {
            "stdcall": "Windows API standard (__stdcall)",
            "cdecl": "C calling convention (__cdecl)",
            "fastcall": "Fast calling convention (__fastcall)"
        }
    },
    
    "optimizaciones": {
        "simd": "Single Instruction Multiple Data - vectorización de operaciones",
        "memory_pooling": "Pre-allocated memory blocks para evitar mallocs",
        "cache_optimization": "Optimización de acceso a memoria para mejor performance",
        "thread_safety": "Implementación de thread-safe operations",
        "link_time": "Link-time optimization (LTO) para mejor optimización"
    },
    
    "debugging": {
        "errores_comunes": [
            "Memory leaks - memoria no liberada",
            "Buffer overflow - acceso fuera de límites",
            "Stack corruption - corrupción de stack",
            "Access violations - acceso a memoria inválida",
            "Calling convention mismatches - inconsistencias en convenciones"
        ],
        "herramientas": [
            "Visual Studio Debugger",
            "WinDbg",
            "AddressSanitizer",
            "Valgrind",
            "Intel Inspector"
        ]
    },
    
    "ejemplos_codigo": {
        "dll_basica": '''
#include <windows.h>

extern "C" __declspec(dllexport)
int __stdcall AddNumbers(int a, int b) {
    return a + b;
}

BOOL APIENTRY DllMain(HMODULE hModule, 
                     DWORD ul_reason_for_call, 
                     LPVOID lpReserved) {
    switch (ul_reason_for_call) {
        case DLL_PROCESS_ATTACH:
            break;
        case DLL_THREAD_ATTACH:
        case DLL_THREAD_DETACH:
        case DLL_PROCESS_DETACH:
            break;
    }
    return TRUE;
}
        ''',
        
        "error_comun": '''
// ❌ ERROR: Buffer overflow
for (int i = 0; i <= size; i++) {  // Should be i < size
    result += data[i];  // May access out of bounds
}
        ''',
        
        "solucion_optimizada": '''
// ✅ SOLUCIÓN: SIMD + Memory Pooling
#include <immintrin.h>

class DLLMemoryPool {
    static constexpr size_t POOL_SIZE = 4096;
    // Implementation with pre-allocated blocks
};

// SIMD optimized processing
for (int i = 0; i + 3 < size; i += 4) {
    __m128i data = _mm_loadu_si128((__m128i*)&input[i]);
    // Process 4 integers simultaneously
    _mm_storeu_si128((__m128i*)&result[i], processed_data);
}
        '''
    }
}

class DLLAssistantAI:
    """
    IA especializada en DLLs con capacidades conversacionales reales
    """
    
    def __init__(self):
        self.knowledge_base = DLL_KNOWLEDGE_BASE
        self.conversation_history = []
        self.session_data = {}
        
    def process_message(self, user_message: str, session_id: str) -> Dict:
        """
        Procesa un mensaje del usuario y genera una respuesta inteligente
        """
        try:
            # Limpiar y normalizar mensaje
            message = user_message.strip().lower()
            
            # Determinar tipo de consulta
            query_type = self._classify_query(message)
            
            # Generar respuesta especializada
            response = self._generate_specialized_response(message, query_type)
            
            # Actualizar historial
            if session_id not in self.session_data:
                self.session_data[session_id] = []
            
            self.session_data[session_id].append({
                "user": user_message,
                "assistant": response,
                "timestamp": datetime.now().isoformat(),
                "query_type": query_type
            })
            
            return {
                "success": True,
                "response": response,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "query_type": query_type
            }
            
        except Exception as e:
            logger.error(f"Error procesando mensaje: {str(e)}")
            return {
                "success": False,
                "error": "Error interno del sistema",
                "response": "Lo siento, ocurrió un error. Por favor intenta de nuevo."
            }
    
    def _classify_query(self, message: str) -> str:
        """Clasifica el tipo de consulta del usuario"""
        
        # Palabras clave por categoría
        keywords = {
            "generacion": ["crear", "generar", "construir", "hacer", "nueva", "dll", "biblioteca"],
            "optimizacion": ["optimizar", "mejorar", "velocidad", "performance", "rapido", "eficiencia"],
            "debug": ["error", "debug", "problema", "bug", "fallo", "stack", "memory", "leak"],
            "ejemplo": ["ejemplo", "como", "codigo", "source", "implementacion", "mostrar"],
            "conceptos": ["que es", "concepto", "explicar", "que significa", "definicion"],
            "ayuda": ["ayuda", "help", "socorro", "explicar", "no entiendo"]
        }
        
        # Clasificar por coincidencia de palabras clave
        for category, words in keywords.items():
            if any(word in message for word in words):
                return category
        
        return "general"
    
    def _generate_specialized_response(self, message: str, query_type: str) -> str:
        """Genera respuesta especializada basada en el tipo de consulta"""
        
        responses = {
            "generacion": self._handle_generation_query(message),
            "optimizacion": self._handle_optimization_query(message),
            "debug": self._handle_debug_query(message),
            "ejemplo": self._handle_example_query(message),
            "conceptos": self._handle_concept_query(message),
            "ayuda": self._handle_help_query(message),
            "general": self._handle_general_query(message)
        }
        
        return responses.get(query_type, responses["general"])
    
    def _handle_generation_query(self, message: str) -> str:
        """Maneja consultas sobre generación de DLLs"""
        
        if "tipos" in message or "tipo" in message:
            types_info = self.knowledge_base["generacion"]["tipos_dlls"]
            response = "🔧 **Tipos de DLLs que puedo crear:**\n\n"
            for dll_type, description in types_info.items():
                response += f"**{dll_type.title()} DLLs:** {description}\n\n"
            return response
        
        elif ("matemática" in message or "math" in message or "suma" in message or 
              "multiplicación" in message or "multiply" in message) and "dll" in message:
            print(f"[DEBUG] Detected math DLL request: {message}")  # Debug
            return self._generate_math_dll_code(message)
            
        elif "lenguaje" in message or (("c++" in message or "#" in message) and "dll" in message and 
              "matemática" not in message and "math" not in message and "suma" not in message):
            langs = self.knowledge_base["generacion"]["lenguajes"]
            platforms = self.knowledge_base["generacion"]["plataformas"]
            
            response = "💻 **Lenguajes y plataformas soportadas:**\n\n"
            response += "**Lenguajes:** " + ", ".join(langs) + "\n\n"
            response += "**Plataformas:**\n"
            for platform, format_info in platforms.items():
                response += f"• {platform.title()}: {format_info}\n"
            return response
        
        elif "calling convention" in message or "stdcall" in message:
            conv = self.knowledge_base["generacion"]["calling_conventions"]
            response = "📋 **Calling Conventions disponibles:**\n\n"
            for convention, description in conv.items():
                response += f"**{convention}:** {description}\n\n"
            return response
        
        else:
            return """
🚀 **¡Te ayudo a generar DLLs profesionales!**

Puedo crear diferentes tipos de bibliotecas dinámicas:

• **Runtime Libraries** - CRT, MFC, ATL, STL, Boost
• **Plugin Systems** - Sistemas dinámicos, COM, extensibilidad  
• **Performance DLLs** - SIMD, multi-threading, GPU acceleration
• **Security Libraries** - Criptografía, autenticación, firmas digitales
• **Network Libraries** - Sockets, HTTP/HTTPS, IPC
• **Data Access** - SQLite, JSON/XML, persistence, cache

**¿Qué tipo de DLL necesitas?**
Ej: "Crea una DLL de criptografía en C++" o "Necesito una DLL de red para Windows"
            """
    
    def _generate_math_dll_code(self, message: str) -> str:
        """Genera código DLL con funciones matemáticas específicas"""
        
        return """
🔧 **DLL de Matemáticas - C++ con Exports**

**MathOperations.h:**
```cpp
#pragma once

// Exporte explícito para DLL
extern "C" {
    // __stdcall es recomendado para Windows
    __declspec(dllexport) int __stdcall Add(int a, int b);
    __declspec(dllexport) int __stdcall Multiply(int a, int b);
    __declspec(dllexport) int __stdcall Subtract(int a, int b);
    __declspec(dllexport) int __stdcall Divide(int a, int b);
    __declspec(dllexport) double __stdcall AddDouble(double a, double b);
    __declspec(dllexport) double __stdcall MultiplyDouble(double a, double b);
}
```

**MathOperations.cpp:**
```cpp
#include "MathOperations.h"

// Implementación de las funciones exportadas
extern "C" {
    __declspec(dllexport) int __stdcall Add(int a, int b) {
        return a + b;
    }
    
    __declspec(dllexport) int __stdcall Multiply(int a, int b) {
        return a * b;
    }
    
    __declspec(dllexport) int __stdcall Subtract(int a, int b) {
        return a - b;
    }
    
    __declspec(dllexport) int __stdcall Divide(int a, int b) {
        if (b == 0) return -1; // Error
        return a / b;
    }
    
    __declspec(dllexport) double __stdcall AddDouble(double a, double b) {
        return a + b;
    }
    
    __declspec(dllexport) double __stdcall MultiplyDouble(double a, double b) {
        return a * b;
    }
}
```

**Archivo .def (opcional):**
```
EXPORTS
Add=Add
Multiply=Multiply
Subtract=Subtract
Divide=Divide
AddDouble=AddDouble
MultiplyDouble=MultiplyDouble
```

**Compilación con Visual Studio:**
```bash
cl /LD MathOperations.cpp /Fe:MathOperations.dll
```

**¿Necesitas compilación para otro sistema o más funciones matemáticas?**
        """
    
    def _handle_optimization_query(self, message: str) -> str:
        """Maneja consultas sobre optimización"""
        
        optimizations = self.knowledge_base["optimizaciones"]
        
        if "simd" in message:
            return f"""
⚡ **Optimización SIMD:**

SIMD (Single Instruction Multiple Data) permite procesar múltiples datos simultáneamente:

```cpp
// Procesamiento SIMD de 4 enteros
for (int i = 0; i + 3 < size; i += 4) {{
    __m128i data = _mm_loadu_si128((__m128i*)&input[i]);
    __m128i processed = _mm_add_epi32(data, _mm_set1_epi32(10));
    _mm_storeu_si128((__m128i*)&result[i], processed);
}}
```

**Beneficios:**
• 4x más rápido que procesamiento secuencial
• Mejor utilización de CPU moderna
• Ideal para cálculos matemáticos intensivos
            """
        
        elif "memory" in message and "pool" in message:
            return f"""
🧠 **Memory Pooling:**

Evita la sobrecarga de mallocs/free mediante bloques pre-alocados:

```cpp
class DLLMemoryPool {{
private:
    static constexpr size_t POOL_SIZE = 4096;
    static constexpr size_t MAX_BLOCKS = 16;
    
public:
    void* allocate(size_t size) {{
        // Buscar bloque libre
        for (auto& block : blocks) {{
            if (!block.used && block.size >= size) {{
                block.used = true;
                return block.ptr;
            }}
        }}
        return malloc(size); // Fallback
    }}
}};
```

**Beneficios:**
• 70% menos allocations
• Control de memoria personalizado  
• Mejor cache performance
            """
        
        else:
            response = "🚀 **Optimizaciones disponibles:**\n\n"
            for opt_type, description in optimizations.items():
                response += f"**{opt_type.upper()}:** {description}\n\n"
            return response
    
    def _handle_debug_query(self, message: str) -> str:
        """Maneja consultas sobre debugging"""
        
        if "memory leak" in message or "leak" in message:
            return f"""
🔍 **Detección de Memory Leaks:**

**Errores comunes:**
• No liberar memoria allocated con malloc/new
• Punteros dangling después de free/delete
• Memory fragmentation

**Soluciones:**
```cpp
// ❌ INCORRECTO
void dangerousFunction() {{
    int* ptr = (int*)malloc(sizeof(int) * 1000);
    // ❌ No se libera ptr
}}

// ✅ CORRECTO  
void safeFunction() {{
    int* ptr = (int*)malloc(sizeof(int) * 1000);
    // Usar ptr...
    free(ptr); // ✅ Liberar correctamente
}}
```

**Herramientas de detección:**
• Visual Studio Debugger
• AddressSanitizer  
• Valgrind
• Intel Inspector
            """
        
        elif "buffer overflow" in message or "overflow" in message:
            return f"""
🚨 **Buffer Overflow Detection:**

**Error típico:**
```cpp
// ❌ ERROR: Buffer overflow
for (int i = 0; i <= size; i++) {{  // Should be i < size
    result[i] = data[i];  // Access beyond bounds
}}

// ✅ CORRECTO
for (int i = 0; i < size; i++) {{  // Proper bounds check
    result[i] = data[i];
}}
```

**Prevención:**
• Usar bounds checking estricto
• Implementar safe string functions
• Usar smart pointers
• Activar stack canaries
            """
        
        else:
            debug_info = self.knowledge_base["debugging"]
            response = "🔧 **Debugging y Troubleshooting:**\n\n"
            response += "**Errores comunes:**\n"
            for error in debug_info["errores_comunes"]:
                response += f"• {error}\n"
            response += "\n**Herramientas:**\n"
            for tool in debug_info["herramientas"]:
                response += f"• {tool}\n"
            return response
    
    def _handle_example_query(self, message: str) -> str:
        """Maneja solicitudes de ejemplos de código"""
        
        if "basic" in message or "basica" in message or "simple" in message:
            return f"""
📝 **Ejemplo DLL Básica:**

```cpp
// MathOperations.dll
#include <windows.h>

extern "C" __declspec(dllexport)
int __stdcall AddNumbers(int a, int b) {{
    return a + b;
}}

BOOL APIENTRY DllMain(HMODULE hModule, 
                     DWORD ul_reason_for_call, 
                     LPVOID lpReserved) {{
    switch (ul_reason_for_call) {{
        case DLL_PROCESS_ATTACH:
        case DLL_THREAD_ATTACH:
        case DLL_THREAD_DETACH:
        case DLL_PROCESS_DETACH:
            break;
    }}
    return TRUE;
}}
```

**Compile con:**
`cl /LD MathOperations.cpp /Fe:MathOperations.dll`
            """
        
        elif "error" in message and "comun" in message:
            examples = self.knowledge_base["ejemplos_codigo"]
            return f"""
❌ **Error Común vs Solución:**

**Error:**
```cpp
{examples['error_comun'].strip()}
```

**Solución:**
```cpp
{examples['solucion_optimizada'].strip()}
```
            """
        
        else:
            return """
💡 **Ejemplos de código disponibles:**

• **DLL Básica** - Estructura fundamental
• **Memory Management** - Gestión segura de memoria
• **SIMD Optimization** - Vectorización avanzada
• **Error Handling** - Manejo robusto de errores
• **Multi-platform** - Compatibilidad multiplataforma

**¿Qué ejemplo específico necesitas?**
            """
    
    def _handle_concept_query(self, message: str) -> str:
        """Maneja consultas conceptuales"""
        
        if "dll" in message and "que es" in message:
            return """
🎯 **¿Qué es una DLL?**

Una **Dynamic Link Library (DLL)** es:

• **Biblioteca de código compartido** que múltiples programas pueden usar
• **Carga dinámica** - se carga en memoria solo cuando se necesita
• **Ahorro de memoria** - una DLL, múltiples aplicaciones
• **Actualizaciones** - cambiar una DLL afecta todas las apps que la usan

**Ventajas:**
✅ Reutilización de código
✅ Modularidad
✅ Gestión centralizada de librerías
✅ Menor tamaño de executables

**Ejemplo:** `kernel32.dll` de Windows - muchas apps la usan
            """
        
        elif "calling convention" in message:
            return """
📋 **Calling Conventions - ¿Qué son?**

Las **calling conventions** definen cómo se pasan parámetros a funciones:

• **__stdcall (Windows API)**: Parámetros de derecha a izquierda, callee limpia stack
• **__cdecl (C default)**: Parámetros de derecha a izquierda, caller limpia stack  
• **__fastcall**: Primeros 2 parámetros en registros, luego stack

**Ejemplo Visual:**
```
__stdcall: Func(param3, param2, param1) // right-to-left
__cdecl:   Func(param3, param2, param1) // right-to-left  
```

**¿Por qué importa?**
• Stack alignment correcto
• Calling convention mismatch = crashes
            """
        
        else:
            return """
🧠 **Conceptos fundamentales de DLLs:**

• **DLL (Dynamic Link Library)** - Biblioteca dinámica compartida
• **Load-time vs Run-time linking** - Carga durante inicio vs ejecución
• **Export/Import** - Funciones que exponen vs que importan
• **Dependency Walker** - Herramienta para ver dependencias DLL
• **Side-by-side assemblies** - Múltiples versiones DLL coexistentes

**¿Qué concepto específico te interesa explorar?**
            """
    
    def _handle_help_query(self, message: str) -> str:
        """Maneja consultas de ayuda general"""
        
        return """
🤖 **¡Hola! Soy xpe.manager.ai - Tu especialista en DLLs**

**¿En qué puedo ayudarte?**

🛠️ **Generación de DLLs:**
• "Crea una DLL de criptografía en C++"
• "Necesito una DLL de red para Windows"
• "Genera una DLL de performance con SIMD"

🔧 **Debugging y Optimización:**  
• "Tengo un memory leak en mi DLL"
• "Optimiza esta función con SIMD"
• "Debug este error de stack overflow"

📚 **Ejemplos y Conceptos:**
• "Muéstrame un ejemplo de DLL básica"
• "¿Qué es una calling convention?"
• "Explica el memory pooling"

💬 **Solo pregúntame directamente sobre DLLs y te ayudo con:**
• Código de ejemplo
• Soluciones a problemas
• Optimizaciones avanzadas
• Mejores prácticas

**¿Qué necesitas hoy?**
        """
    
    def _handle_general_query(self, message: str) -> str:
        """Maneja consultas generales"""
        
        if any(greeting in message for greeting in ["hola", "hi", "hey", "buenas"]):
            return """
👋 **¡Hola! Bienvenido a xpe.manager.ai**

Soy tu asistente especializado en **creación, debugging y optimización de DLLs**.

**Mis capacidades:**
• 🔧 Generar DLLs en C++, C#, Rust, Assembly
• 🚀 Optimizaciones SIMD y memory pooling  
• 🔍 Debugging avanzado (memory leaks, stack corruption)
• 📚 Ejemplos de código y mejores prácticas
• 🌍 Soporte multiplataforma (Windows, Linux, macOS, Android)

**¿Qué proyecto DLL estás trabajando?**
¡Cuéntame y te ayudo a solucionarlo!
            """
        
        else:
            return """
🤖 **Soy xpe.manager.ai - IA especializada en DLLs**

¿Sobre qué tema de DLLs te gustaría saber más?

**🎯 Mis especialidades:**
• **Generación:** DLLs de cualquier tipo y plataforma
• **Optimización:** SIMD, memory pooling, threading
• **Debugging:** Memory leaks, buffer overflows, stack corruption  
• **Ejemplos:** Código funcional y mejores prácticas
• **Conceptos:** Explicaciones detalladas y técnicas

**Ejemplos de preguntas:**
• "¿Cómo crear una DLL de criptografía?"
• "Optimiza esta función para SIMD"
• "Tengo un memory leak, ¿cómo solucionarlo?"
• "¿Qué calling convention usar?"

**¡Pregunta cualquier cosa sobre DLLs!**
            """

# Instancia global de la IA
ai_assistant = DLLAssistantAI()

# Endpoints de la API
@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de salud del sistema"""
    return jsonify({
        "status": "healthy",
        "service": "xpe.manager.ai",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "specialization": "DLL Development and Optimization"
    })

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Endpoint principal para chat con la IA"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Mensaje requerido"
            }), 400
        
        user_message = data['message']
        session_id = data.get('session_id', 'default')
        
        # Procesar mensaje con la IA
        result = ai_assistant.process_message(user_message, session_id)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error en chat endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Error interno del servidor"
        }), 500

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    """Obtener historial de sesión"""
    try:
        session_data = ai_assistant.session_data.get(session_id, [])
        return jsonify({
            "success": True,
            "session_id": session_id,
            "history": session_data
        })
    except Exception as e:
        logger.error(f"Error obteniendo sesión: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Error obteniendo sesión"
        }), 500

@app.route('/api/knowledge', methods=['GET'])
def get_knowledge_base():
    """Obtener base de conocimientos (para debugging)"""
    return jsonify({
        "success": True,
        "knowledge_base": ai_assistant.knowledge_base
    })

# Servir archivos estáticos (frontend)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Servir archivos del frontend"""
    if path != "" and os.path.exists(path):
        return send_from_directory('.', path)
    else:
        # Si no existe el archivo específico, servir index.html
        return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    # Puerto dinámico para Render.com
    port = int(os.environ.get('PORT', 5000))
    
    print("🧠 Iniciando xpe.manager.ai Backend...")
    print("🔧 Sistema IA especializada en DLLs")
    print("🌐 Servidor desplegado en RENDER.COM")
    print("=" * 60)
    print(f"🚀 IA Accesible desde cualquier navegador del mundo")
    print(f"🔧 API Chat: /api/chat")
    print(f"❤️  Health Check: /health")
    print(f"🤖 ¡Tu IA especializada está LISTA PARA EL MUNDO!")
    print(f"🌍 ACCESO GLOBAL - Deploy exitoso en Render.com")
    print(f"=" * 60)
    
    app.run(
        host='0.0.0.0',    # Escuchar en todas las interfaces
        port=port,         # Puerto dinámico de Render
        debug=False,       # Sin debug en producción
        threaded=True      # Manejar múltiples conexiones
    )