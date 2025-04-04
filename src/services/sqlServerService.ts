
import axios from 'axios';
import { toast } from 'sonner';
import { Checklist, ChecklistHistory, Equipment, Operator, Sector, Employee } from '@/types/checklist';

// Função para obter a URL da API com base na configuração
export const getApiUrl = () => {
  const useLocalDb = localStorage.getItem('useLocalDb') === 'true';
  return useLocalDb 
    ? 'http://localhost:3000/api' // URL para banco de dados local
    : 'http://172.16.2.94:3000/api'; // URL para banco de dados remoto
};

// URL base da API backend que se conecta ao PostgreSQL
export const API_URL = getApiUrl();

// Interface para realizar requisições HTTP para o PostgreSQL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 10000 // Define um timeout de 10 segundos
});

// Método para salvar um checklist no PostgreSQL
export const saveChecklistToServer = async (checklist: Checklist): Promise<Checklist> => {
  try {
    console.log('Salvando checklist no servidor:', checklist);
    const response = await api.post('/checklists', checklist);
    toast.success('Checklist salvo no banco de dados com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar checklist no banco de dados:', error);
    toast.error('Falha ao salvar no banco de dados. Salvando localmente como backup.');
    
    // Fallback para salvar localmente se o banco de dados estiver inacessível
    const { saveChecklistToHistory } = await import('./historyService');
    saveChecklistToHistory(checklist);
    
    throw error;
  }
};

// Obter equipamentos do PostgreSQL com força bruta anti-cache
export const getEquipmentsFromServer = async (forceRefresh = false): Promise<Equipment[]> => {
  try {
    // Sempre adiciona um parâmetro de timestamp único para evitar cache do navegador e do servidor
    const timestamp = Date.now();
    const randomParam = Math.random().toString(36).substring(7);
    const currentApiUrl = getApiUrl(); // Obter URL atualizada
    
    console.log(`Buscando equipamentos do servidor com timestamp: ${timestamp} e random: ${randomParam}`);
    console.log(`URL da API: ${currentApiUrl}`);
    
    // Vamos fazer uma requisição completamente nova a cada vez
    const response = await axios({
      method: 'get',
      url: `${currentApiUrl}/equipments`,
      params: {
        t: timestamp,
        r: randomParam,
        forceRefresh: true
      },
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 10000
    });
    
    console.log('Equipamentos recebidos do servidor:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('Resposta não é um array:', response.data);
      throw new Error('Formato de resposta inválido');
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar equipamentos do banco de dados:', error);
    toast.error('Falha ao buscar equipamentos do servidor. Usando dados locais.');
    
    // Fallback para dados locais
    const { getEquipments } = await import('./checklistService');
    const localData = await getEquipments();
    console.log('Usando equipamentos locais:', localData);
    return localData;
  }
};

// Obter operadores do PostgreSQL com força bruta anti-cache
export const getOperatorsFromServer = async (forceRefresh = false): Promise<Operator[]> => {
  try {
    // Sempre adiciona um parâmetro de timestamp único para evitar cache do navegador e do servidor
    const timestamp = Date.now();
    const randomParam = Math.random().toString(36).substring(7);
    const currentApiUrl = getApiUrl(); // Obter URL atualizada
    
    console.log(`Buscando operadores do servidor com timestamp: ${timestamp} e random: ${randomParam}`);
    console.log(`URL da API: ${currentApiUrl}`);
    
    // Vamos fazer uma requisição completamente nova a cada vez
    const response = await axios({
      method: 'get',
      url: `${currentApiUrl}/operators`,
      params: {
        t: timestamp,
        r: randomParam,
        forceRefresh: true
      },
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 10000
    });
    
    console.log('Operadores recebidos do servidor:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('Resposta não é um array:', response.data);
      throw new Error('Formato de resposta inválido');
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar operadores do banco de dados:', error);
    toast.error('Falha ao buscar operadores do servidor. Usando dados locais.');
    
    // Fallback para dados locais
    const { getOperators } = await import('./operatorsService');
    const localData = await getOperators();
    console.log('Usando operadores locais:', localData);
    return localData;
  }
};

// Obter setores do PostgreSQL
export const getSectorsFromServer = async (forceRefresh = false): Promise<Sector[]> => {
  try {
    // Sempre adiciona um parâmetro de timestamp único para evitar cache do navegador e do servidor
    const timestamp = Date.now();
    const randomParam = Math.random().toString(36).substring(7);
    const currentApiUrl = getApiUrl(); // Obter URL atualizada
    
    console.log(`Buscando setores do servidor com timestamp: ${timestamp} e random: ${randomParam}`);
    
    const response = await axios({
      method: 'get',
      url: `${currentApiUrl}/sectors`,
      params: {
        t: timestamp,
        r: randomParam,
        forceRefresh: true
      },
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      timeout: 10000
    });
    
    console.log('Setores recebidos do servidor:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('Resposta não é um array:', response.data);
      throw new Error('Formato de resposta inválido');
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar setores do banco de dados:', error);
    toast.error('Falha ao buscar setores do servidor.');
    return [];
  }
};

// Obter histórico de checklists do PostgreSQL
export const getChecklistHistoryFromServer = async (): Promise<ChecklistHistory[]> => {
  try {
    const timestamp = Date.now();
    const randomParam = Math.random().toString(36).substring(7);
    const currentApiUrl = getApiUrl(); // Obter URL atualizada
    
    const response = await axios.get(`${currentApiUrl}/checklists/history?t=${timestamp}&r=${randomParam}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico do banco de dados:', error);
    toast.error('Falha ao buscar histórico do servidor. Usando dados locais.');
    
    // Fallback para dados locais
    const { getChecklistHistory } = await import('./historyService');
    return getChecklistHistory();
  }
};

// Sincronizar histórico local com o PostgreSQL
export const syncLocalHistoryWithServer = async (): Promise<void> => {
  try {
    const { getChecklistHistory } = await import('./historyService');
    const localHistory = getChecklistHistory();
    
    if (localHistory.length === 0) return;
    
    const currentApiUrl = getApiUrl(); // Obter URL atualizada
    await axios.post(`${currentApiUrl}/checklists/sync`, { checklists: localHistory });
    toast.success('Histórico local sincronizado com o banco de dados!');
  } catch (error) {
    console.error('Erro ao sincronizar histórico com banco de dados:', error);
    toast.error('Falha ao sincronizar dados com o servidor');
  }
};
