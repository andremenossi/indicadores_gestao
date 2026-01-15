
/**
 * Calcula a diferença em minutos entre duas strings de tempo no formato HH:mm.
 * Trata a virada de meia-noite (caso o início da próxima seja numericamente menor que o fim da anterior).
 */
export const calculateIntervalMinutes = (endPrev: string, startNext: string): number => {
  const [endH, endM] = endPrev.split(':').map(Number);
  const [startH, startM] = startNext.split(':').map(Number);
  
  const endTotal = endH * 60 + endM;
  const startTotal = startH * 60 + startM;
  
  let diff = startTotal - endTotal;
  
  // Se o resultado for negativo, significa que passou da meia-noite
  if (diff < 0) {
    diff += 1440; // 24 horas * 60 minutos
  }
  
  return diff;
};

/**
 * Formata uma string de data de YYYY-MM-DD para DD-MM-YYYY.
 */
export const displayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};
