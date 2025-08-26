# EJERCICIO 10.1 \- Creando la interfaz de gestión de aplicaciones de LTI

# **RESOLUCIÓN DEL EJERCICIO**

## ***ESTRATEGIA***

* IDE: CURSOR PRO PLAN  
* MODELO: CLAUDE 4 SONNET  
* ESTRATEGIA DE IMPLEMENTACIÓN: [https://github.com/buildermethods/agent-os](https://github.com/buildermethods/agent-os) ([https://buildermethods.com/agent-os](https://buildermethods.com/agent-os))  
  * Quería probar esta metodología/estrategia (whatever 😅) explicada en la sesión de backend

## ***PREWORK***

* Instalación base de agent-os  
  * curl https://raw.githubusercontent.com/buildermethods/agent-os/main/setup/base.sh | bash \-s \-- \--cursor  
* Instalación de agent-os en el proyecto AI4Devs-frontend-sr-01  
  * \~/.agent-os/setup/[project.sh](http://project.sh)  
* Solución de varios problemas de agent-os, la instalación no funcionó como esperaba:   
  * Por los cambios de la versión de cursor no cogía las cursor-rules  
  * Me “emperré” en usar slash-command en cursor en vez de cursor-rules y costó afinarlo y que cursor reconociera los commands  
  * En general agent-os parece mejor preparado para claude code que para cursor (tuve problemas también con el concepto de "subagent", quizá porque mezclé lo preparado para cursor con los commands de Claude Code) 
* Especificaciones “lite” para el ejercicio:  prompts\\DESCRIPTION POSITION [BOARD.md](http://BOARD.md)  
  * A partir de éste, el modelo, usando la metodología de agent-os, creó mejores especificaciones que las mías.

## ***PROMPTS***

### PROMPT 1

**/analyze-product** 

#### Feedback del resultado

Usando este comando el modelo revisa el codebase y genera una documentación base del producto existente:  
\- ✓ \*\*Product Mission\*\* (\`.agent-os/product/mission.md\`) \- Comprehensive mission statement and value proposition  
\- ✓ \*\*Mission Lite\*\* (\`.agent-os/product/mission-lite.md\`) \- Condensed mission for AI context  
\- ✓ \*\*Tech Stack\*\* (\`.agent-os/product/tech-stack.md\`) \- Complete technology inventory with versions  
\- ✓ \*\*Product Roadmap\*\* (\`.agent-os/product/roadmap.md\`) \- Phase 0 completed features \+ future phases  
\- ✓ \*\*Product Pillars\*\* (\`.agent-os/product/pillars.md\`) \- Four core pillars with success metrics  
\- ✓ \*\*Architecture Decisions\*\* (\`.agent-os/product/decisions.md\`) \- Comprehensive technical decision log

**✅** Buena calidad y estructura del output generado por el modelo

### PROMPT 2

**/create-spec using @DESCRIPTION POSITION BOARD.md** 

#### Feedback del resultado

El modelo genera especificaciones detalladas sobre la interfaz a generar (kanban estados de los applicants o "position board")  
\- \*\*Spec Requirements\*\*: \`.agent-os/specs/2025-08-25-position-board-kanban/spec.md\`  
\- \*\*Spec Summary\*\*: \`.agent-os/specs/2025-08-25-position-board-kanban/spec-lite.md\`  
\- \*\*Technical Spec\*\*: \`.agent-os/specs/2025-08-25-position-board-kanban/sub-specs/technical-spec.md\`  
\- \*\*API Spec\*\*: \`.agent-os/specs/2025-08-25-position-board-kanban/sub-specs/[api-spec.md](http://api-spec.md)\`

**✅** Buena calidad y estructura del output generado por el modelo

### PROMPT 3

/create-tasks 

#### Feedback del resultado

Este commando secuencia las tareas y subtareas para desarrollar las especificaciones generadas en el comando anterior. Se genera el fichero de tareas .agent-os\\specs\\2025-08-25-position-board-kanban\\[tasks.md](http://tasks.md)

**✅** Buena calidad y estructura del output generado por el modelo

### PROMPT 4

“Yes” \> *\*El modelo me pregunta al acabar la tarea anterior si debe empezar con la tarea 1 y sus subtareas*

#### Feedback del resultado

❌ El modelo me intenta colar como “hecha” la primera tarea cuando el proyecto ni siquiera compila 😒 le regaño, las aguas vuelven a su cauce 😁:

*\*\*User\*\**

*how can you say the basic routing, components and navigation are functional? when I start the server I have a compilation error and I can't navigate: ERROR in src/components/PositionBoard.tsx:58:25*  
*TS2345: Argument of type 'Object' is not assignable to parameter of type 'SetStateAction\<PositionData | null\>'.*  
  *The 'Object' type is assignable to very few other types. Did you mean to use the 'any' type instead?*  
    *56 |         // Fetch position and interview flow data*  
    *57 |         const positionResponse \= await getInterviewFlow(parseInt(id));*  
  *\> 58 |         setPositionData(positionResponse);*  
       *|                         ^^^^^^^^^^^^^^^^*  
    *59 |*  
    *60 |         // Fetch candidates for this position*  
    *61 |         const candidatesResponse \= await getCandidatesByPosition(parseInt(id));*

*\*\*Cursor\*\**

*You're absolutely right\! I apologize for the oversight. There's a TypeScript compilation error that's preventing the application from running properly. Let me fix this issue immediately.*

### PROMPT 5

/execute-tasks taking into account that task 1 is done, proceed with task 2 (Implement Core API Service Layer)

#### Feedback del resultado

**✅**A nivel técnico el resultado es bueno (dentro de lo que mis escasos conocimientos de front me dejan valorar… el desarrollo va funcionando y el modelo desarrolla aplicando TDD).

**❌**Pero la aplicación de agent-os empieza a hacer aguas 🥹  el modelo no está aplicando la metodología de agent-os en este punto, vamos, está haciendo un poco lo que quiere. El modelo y yo optamos por seguir adelante con la metodología actual, abordando y validando secuencialmente las tareas descritas en .agent-os\\specs\\2025-08-25-position-board-kanban\\[tasks.md](http://tasks.md):   

***Recommendation: Since we've made good progress and the code quality is high, I suggest continuing with an adapted methodology that incorporates the best practices review and systematic approach, but without waiting for subagents that aren't available.What's your preference? *** 
 

### PROMPT 6 y sucesivos

I agree with you, let's continue with the pragmatic approach for task 3 and we will discover later what "subagent" means

#### Feedback del resultado

**✅** El desarrollo se realiza sin problemas por parte del modelo casi sin intervención. Personalmente me siento más cómoda trabajando de manera iterativa y validando el resultado de cada fase del desarrollo, veo que da buenos resultados, aunque el modelo tiende a adelantar tareas y a añadir nuevas mejoras no requeridas, en un proyecto real esto hay que controlarlo “más duramente” 

### PROMPTS REFINAMIENTO 1

Funciona perfecto :) como refinamiento adicional, el kanban queda muy alargado y no tiene nada de color, podríamos ponerlo en una card para que no quede tan estirado en una pantalla grande? y ponerle un poco de color? 😁 compara la pagina inicial con la de position 

#### Feedback del resultado

*\*El desarrollo funciona correctamente, nada que resaltar*

PROMPTS REFINAMIENTO 2  
Está genial, solo un detalle, en modo desktop todos los estados debería estar en una sola fila (tipo kanban), esto es obligatorio, con la card actual si hay un 4º estado “salta” a una segunda fila. El principal problema es que hay demasiado espacio libre entre los stages, te paso una imagen. Por favor, revísalo 😊

#### Feedback del resultado

*\*El desarrollo funciona correctamente, nada que resaltar*

## ***Valoración final***

* El resultado me parece muy bueno, necesito ahondar más en las metodologías para conseguir un proceso cohesivo y reproducible que pueda ser usado en un contexto real (empresarial).  
*  A nivel de desarrollo de front me parece casi magia, con casi 0 conocimiento de tecnologías frontend y sin escribir una linea de código, ser capaz de hacer esto en un par de horas (me ha llevado mucho más tiempo hcer funcionar malamente agent-os y escribir esta memoria que el desarrollo en sí 😁)  
* Adjunto video del resultado final en prompts\2025-08-26_Position board.mp4


