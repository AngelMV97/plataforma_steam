// frontend/src/config/rubrics.ts
const RUBRICS = {
  '9': {
    name: 'Explorador',
    dimensions: {
      representacion: {
        name: 'Representación y modelación',
        inicial: 'Describe verbalmente sin organización',
        en_desarrollo: 'Usa dibujos simples',
        competente: 'Usa esquemas claros',
        avanzado: 'Usa múltiples representaciones'
      },
      abstraccion: {
        name: 'Abstracción y manejo de supuestos',
        inicial: 'Se queda en detalles',
        en_desarrollo: 'Identifica lo relevante con ayuda',
        competente: 'Distingue lo esencial',
        avanzado: 'Simplifica conscientemente'
      },
      estrategia: {
        name: 'Estrategia y planificación',
        inicial: 'Actúa por ensayo-error',
        en_desarrollo: 'Intenta un plan básico',
        competente: 'Sigue un plan claro',
        avanzado: 'Ajusta su plan'
      },
      argumentacion: {
        name: 'Argumentación y justificación',
        inicial: 'Da respuestas sin justificar',
        en_desarrollo: 'Justifica parcialmente',
        competente: 'Explica con claridad',
        avanzado: 'Explica y ejemplifica'
      },
      metacognicion: {
        name: 'Metacognición y revisión',
        inicial: 'No reflexiona',
        en_desarrollo: 'Reconoce errores',
        competente: 'Analiza errores',
        avanzado: 'Aprende de errores'
      },
      transferencia: {
        name: 'Transferencia y conexión',
        inicial: 'No conecta ideas',
        en_desarrollo: 'Conecta con ayuda',
        competente: 'Reconoce similitudes',
        avanzado: 'Aplica ideas a otros casos'
      }
    }
  },

  '10': { // NIVEL B — Analista
    name: 'Analista',
    dimensions: {
      representacion: {
        name: 'Representación y modelación',
        inicial: 'Representa parcialmente',
        en_desarrollo: 'Usa esquemas adecuados',
        competente: 'Usa modelos claros',
        avanzado: 'Elige la mejor representación'
      },
      abstraccion: {
        name: 'Abstracción y manejo de supuestos',
        inicial: 'Le cuesta eliminar ruido',
        en_desarrollo: 'Identifica invariantes',
        competente: 'Usa estructuras',
        avanzado: 'Justifica simplificaciones'
      },
      estrategia: {
        name: 'Estrategia y planificación',
        inicial: 'Estrategia implícita',
        en_desarrollo: 'Estrategia básica explícita',
        competente: 'Estrategia coherente',
        avanzado: 'Compara estrategias'
      },
      argumentacion: {
        name: 'Argumentación y justificación',
        inicial: 'Justifica con ejemplos',
        en_desarrollo: 'Usa razonamiento lógico',
        competente: 'Justifica con claridad',
        avanzado: 'Anticipa objeciones'
      },
      metacognicion: {
        name: 'Metacognición y revisión',
        inicial: 'Reflexión superficial',
        en_desarrollo: 'Identifica fallos',
        competente: 'Ajusta enfoques',
        avanzado: 'Evalúa su proceso'
     },
      transferencia: {
        name: 'Transferencia y conexión',
        inicial: 'Reconoce similitudes',
        en_desarrollo: 'Aplica ideas conocidas',
        competente: 'Adapta ideas',
        avanzado: 'Transfiere a nuevos contextos'
      }
    }
  },

  '11': { // NIVEL C — Constructor
    name: 'Constructor',
    dimensions: {
      representacion: {
        name: 'Representación y modelación',
        inicial: 'Usa modelos estándar',
        en_desarrollo: 'Ajusta modelos',
        competente: 'Construye modelos',
        avanzado: 'Diseña modelos eficientes'
      },
      abstraccion: {
        name: 'Abstracción y manejo de supuestos',
        inicial: 'Aplica reglas conocidas',
        en_desarrollo: 'Identifica estructuras',
        competente: 'Usa abstracción conscientemente',
        avanzado: 'Evalúa límites del modelo'
      },
      estrategia: {
        name: 'Estrategia y planificación',
        inicial: 'Plan parcial',
        en_desarrollo: 'Plan completo',
        competente: 'Plan optimizado',
        avanzado: 'Plan flexible'
      },
      argumentacion: {
        name: 'Argumentación y justificación',
        inicial: 'Justifica informalmente',
        en_desarrollo: 'Usa razonamiento estructurado',
        competente: 'Argumenta con rigor',
        avanzado: 'Argumenta con generalidad'
      },
      metacognicion: {
        name: 'Metacognición y revisión',
        inicial: 'Revisa superficialmente',
        en_desarrollo: 'Analiza decisiones',
        competente: 'Aprende de errores',
        avanzado: 'Anticipa errores'
      },
      transferencia: {
        name: 'Transferencia y conexión',
        inicial: 'Aplica en contextos similares',
        en_desarrollo: 'Generaliza',
        competente: 'Adapta a nuevos dominios',
        avanzado: 'Transfiere entre disciplinas'
      }
    }
  },

  graduate: { // NIVEL D — Estratega
    name: 'Estratega',
    dimensions: {
      representacion: {
        name: 'Representación y modelación',
        inicial: 'Usa modelos conocidos',
        en_desarrollo: 'Ajusta modelos complejos',
        competente: 'Elige modelos óptimos',
        avanzado: 'Crea nuevos enfoques'
      },
      abstraccion: {
        name: 'Abstracción y manejo de supuestos',
        inicial: 'Usa abstracción estándar',
        en_desarrollo: 'Evalúa supuestos',
        competente: 'Ajusta supuestos',
        avanzado: 'Propone nuevos marcos'
      },
      estrategia: {
        name: 'Estrategia y planificación',
        inicial: 'Estrategia funcional',
        en_desarrollo: 'Estrategia eficiente',
        competente: 'Estrategia óptima',
        avanzado: 'Estrategia creativa'
      },
      argumentacion: {
        name: 'Argumentación y justificación',
        inicial: 'Justificación correcta',
        en_desarrollo: 'Argumentación rigurosa',
        competente: 'Demostración sólida',
        avanzado: 'Razonamiento elegante'
      },
      metacognicion: {
        name: 'Metacognición y revisión',
        inicial: 'Revisa al final',
        en_desarrollo: 'Controla el proceso',
        competente: 'Optimiza decisiones',
        avanzado: 'Regula su pensamiento'
      },
      transferencia: {
        name: 'Transferencia y conexión',
        inicial: 'Aplica a problemas conocidos',
        en_desarrollo: 'Adapta ideas',
        competente: 'Transfiere con facilidad',
        avanzado: 'Genera nuevas aplicaciones'
      }
    }
  }
} as const;

export default RUBRICS;