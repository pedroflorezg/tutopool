// Configuración del Webhook de n8n para enviar notificaciones de WhatsApp
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.tuservidor.com/webhook/tutor-confirmation';

/**
 * Función que dispara el flujo en n8n enviando los datos clave de la tutoría
 * para notificar al tutor vía WhatsApp en tiempo real.
 * 
 * @param {Object} solicitud Datos de la solicitud creada
 * @param {Object} estudiante Datos básicos del estudiante (nombre, email)
 * @param {Object} tutor Datos básicos del tutor asignado
 */
export async function triggerTutorConfirmation(solicitud, estudiante, tutor) {
  try {
    const payload = {
      event: 'nueva_tutoria_creada',
      data: {
        solicitud: {
          id: solicitud.id || 'temp-' + Date.now(),
          materia_id: solicitud.materia_id,
          fecha: solicitud.fecha_preferida,
          hora: solicitud.hora_preferida,
          duracion_minutos: solicitud.duracion || 60,
          formato: solicitud.formato,
          tipo: solicitud.tipo,
        },
        estudiante: {
          id: estudiante.id,
          nombre: estudiante.user_metadata?.nombre || estudiante.email,
        },
        tutor: {
          id: tutor.id,
          nombre: tutor.nombre,
          telefono: tutor.telefono || '+573000000000' // Dato clave para WhatsApp
        }
      }
    };

    console.log('[n8n] Enviando webhook de confirmación:', payload);

    // En un entorno de producción o pruebas con el webhook real, se enviaría así:
    // const response = await fetch(N8N_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
    
    // Simular retraso de red para la demo
    await new Promise(r => setTimeout(r, 800));
    
    // if (!response.ok) {
    //   console.error('[n8n] Error al procesar webhook');
    // }
    
    return true;
  } catch (err) {
    console.error('[n8n] Error de red contactando n8n:', err);
    return false; // Evitamos romper el flujo principal si n8n se cae
  }
}
