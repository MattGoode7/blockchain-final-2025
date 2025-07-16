import { parseISO } from 'date-fns';

export function validateAndConvertTime(iso: string, checkPast = true): { timestamp: number; valid: boolean; error?: string } {
  try {
    const dt = parseISO(iso);
    if (isNaN(dt.getTime())) {
      return { timestamp: 0, valid: false, error: 'Formato de tiempo incorrecto' };
    }

    const timestamp = Math.floor(dt.getTime() / 1000);
    if (checkPast) {
      const now = Math.floor(Date.now() / 1000);
      if (timestamp <= now) {
        return { timestamp: 0, valid: false, error: 'Tiempo de cierre inválido' };
      }
    }

    return { timestamp, valid: true };
  } catch (e) {
    return { timestamp: 0, valid: false, error: 'Formato de tiempo incorrecto' };
  }
} 