
import axios from 'axios';
import { toast } from 'sonner';
import { Checklist, ChecklistHistory, Equipment, Operator } from '@/types/checklist';

// URL base da sua API backend que se conecta ao SQL Server
// Substitua pelo endereço real do seu backend quando estiver pronto
const API_URL = 'http://localhost:3000/api';

// Interface para realizar requisições HTTP para o SQL Server
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Método para salvar um checklist no SQL Server
export const saveChecklistToServer = async (checklist: Checklist): Promise<Checklist> => {
  try {
    const response = await api.post('/checklists', checklist);
    toast.success('Checklist salvo no SQL Server com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar checklist no SQL Server:', error);
    toast.error('Falha ao salvar no SQL Server. Salvando localmente como backup.');
    
    // Fallback para salvar localmente se o SQL Server estiver inacessível
    const { saveChecklistToHistory } = await import('./historyService');
    saveChecklistToHistory(checklist);
    
    throw error;
  }
};

// Obter equipamentos do SQL Server
export const getEquipmentsFromServer = async (): Promise<Equipment[]> => {
  try {
    const response = await api.get('/equipments');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar equipamentos do SQL Server:', error);
    toast.error('Falha ao buscar equipamentos do servidor. Usando dados locais.');
    
    // Fallback para dados locais
    const { equipmentsList } = await import('./checklistService');
    return equipmentsList;
  }
};

// Obter operadores do SQL Server
export const getOperatorsFromServer = async (): Promise<Operator[]> => {
  try {
    const response = await api.get('/operators');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar operadores do SQL Server:', error);
    toast.error('Falha ao buscar operadores do servidor. Usando dados locais.');
    
    // Fallback para dados locais
    const { getOperators } = await import('./operatorsService');
    return getOperators();
  }
};

// Obter histórico de checklists do SQL Server
export const getChecklistHistoryFromServer = async (): Promise<ChecklistHistory[]> => {
  try {
    const response = await api.get('/checklists/history');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico do SQL Server:', error);
    toast.error('Falha ao buscar histórico do servidor. Usando dados locais.');
    
    // Fallback para dados locais
    const { getChecklistHistory } = await import('./historyService');
    return getChecklistHistory();
  }
};

// Sincronizar histórico local com o SQL Server
export const syncLocalHistoryWithServer = async (): Promise<void> => {
  try {
    const { getChecklistHistory } = await import('./historyService');
    const localHistory = getChecklistHistory();
    
    if (localHistory.length === 0) return;
    
    await api.post('/checklists/sync', { checklists: localHistory });
    toast.success('Histórico local sincronizado com o SQL Server!');
  } catch (error) {
    console.error('Erro ao sincronizar histórico com SQL Server:', error);
    toast.error('Falha ao sincronizar dados com o servidor');
  }
};
