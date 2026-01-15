
import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar estado persistido no localStorage.
 * @param key Chave do localStorage
 * @param initialValue Valor inicial caso não exista nada salvo
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  // Passamos uma função para o useState para que a lógica de leitura seja executada apenas uma vez no mount
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Retorna uma versão "wrapada" da função setter do useState que
  // persiste o novo valor no localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permite que o valor seja uma função para termos a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salva o estado
      setStoredValue(valueToStore);
      
      // Salva no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}
