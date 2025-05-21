import axios from 'axios';
import { toast } from 'sonner';
import { Checklist, ChecklistHistory, Equipment, Operator, Sector, Employee } from '@/types/checklist';

// Função para obter a URL da API com base na configuração
export const getApiUrl = () => {
  const useLocalDb = localStorage.getItem('useLocalDb') === 'true';
  const localDbUrl = localStorage.getItem('localDbUrl') || 'http://localhost:3000';
  const remoteDbUrl = localStorage.getItem('remoteDbUrl') || 'http://172.16.2.94:3000';
  
  return useLocalDb ? `${localDbUrl}/api` : `${remoteDbUrl}/api`;
};

// Verificar se o usuário optou por usar o IndexedDB em vez do PostgreSQL
export const isUsingIndexedDB = () => {
  return localStorage.getItem('useIndexedDb') === 'true';
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

// Configurar o axios para mostrar informações de depuração em caso de erro
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('Resposta de erro do servidor:', error.response.data);
      console.log('Status do erro:', error.response.status);
    } else if (error.request) {
      console.log('Requisição enviada mas sem resposta:', error.request);
    } else {
      console.log('Erro ao configurar requisição:', error.message);
    }
    return Promise.reject(error);
  }
);

// Inicializa o IndexedDB
const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('checklistDB', 1);
    
    request.onerror = (event) => {
      console.error('Erro ao abrir IndexedDB:', event);
      reject('Não foi possível abrir o banco de dados IndexedDB');
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Criar stores para os diferentes tipos de dados se não existirem
      if (!db.objectStoreNames.contains('equipments')) {
        db.createObjectStore('equipments', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('operators')) {
        db.createObjectStore('operators', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('sectors')) {
        db.createObjectStore('sectors', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('checklists')) {
        const checklistStore = db.createObjectStore('checklists', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

// Método para testar a conexão com o servidor PostgreSQL diretamente
export const testPostgresConnection = async () => {
  const dbHost = localStorage.getItem('dbHost') || 'localhost';
  const dbPort = localStorage.getItem('dbPort') || '5432';
  const dbName = localStorage.getItem('dbName') || 'checklist_db';
  const dbUser = localStorage.getItem('dbUser') || 'postgres';
  const dbPassword = localStorage.getItem('dbPassword') || '';

  try {
    const apiUrl = getApiUrl();
    const response = await axios.post(`${apiUrl.replace('/api', '')}/test-postgres`, {
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword
    });
    
    return {
      success: true,
      message: response.data.message || 'Conexão bem sucedida',
      info: response.data
    };
  } catch (error) {
    console.error('Erro ao testar conexão PostgreSQL:', error);
    return {
      success: false,
      message: 'Falha na conexão direta com PostgreSQL',
      error
    };
  }
};

// Método para salvar um checklist (IndexedDB ou PostgreSQL)
export const saveChecklistToServer = async (checklist: Checklist): Promise<Checklist> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Salvando checklist no IndexedDB:', checklist);
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('checklists', 'readwrite');
        const store = transaction.objectStore('checklists');
        
        // Se não tiver ID, o autoIncrement vai gerar um
        const request = store.add({
          ...checklist,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        request.onsuccess = () => {
          toast.success('Checklist salvo com sucesso!');
          // Garantimos que o ID retornado é do tipo number para corresponder à assinatura da função
          const newId = typeof request.result === 'number' ? request.result : Number(request.result);
          resolve({ ...checklist, id: newId });
        };
        
        request.onerror = () => {
          // Removed error toast
          console.error('Falha ao salvar no IndexedDB');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao salvar checklist no IndexedDB:', error);
      // Removed error toast
      
      // Fallback para salvar localmente
      const { saveChecklistToHistory } = await import('./historyService');
      saveChecklistToHistory(checklist);
      
      throw error;
    }
  } else {
    try {
      console.log('Salvando checklist no servidor:', checklist);
      const response = await api.post('/checklists', checklist);
      toast.success('Checklist salvo com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar checklist no banco de dados:', error);
      // Removed error toast
      
      // Fallback para salvar localmente se o banco de dados estiver inacessível
      const { saveChecklistToHistory } = await import('./historyService');
      saveChecklistToHistory(checklist);
      
      throw error;
    }
  }
};

// Obter equipamentos (IndexedDB ou PostgreSQL)
export const getEquipmentsFromServer = async (forceRefresh = false): Promise<Equipment[]> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Buscando equipamentos do IndexedDB');
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('equipments', 'readonly');
        const store = transaction.objectStore('equipments');
        const request = store.getAll();
        
        request.onsuccess = () => {
          const data = request.result;
          console.log('Equipamentos recebidos do IndexedDB:', data);
          
          if (data.length === 0 && forceRefresh) {
            // Se não houver dados no IndexedDB e forceRefresh=true, usar dados locais
            import('./checklistService').then(module => {
              const localData = module.equipmentsList;
              console.log('Carregando equipamentos locais para o IndexedDB:', localData);
              
              // Salvar dados locais no IndexedDB para uso futuro
              const saveTransaction = db.transaction('equipments', 'readwrite');
              const saveStore = saveTransaction.objectStore('equipments');
              
              localData.forEach(item => {
                saveStore.add(item);
              });
              
              resolve(localData);
            }).catch(err => {
              console.error('Erro ao importar dados locais:', err);
              reject(err);
            });
          } else {
            resolve(data);
          }
        };
        
        request.onerror = () => {
          console.error('Erro ao buscar equipamentos do IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao acessar IndexedDB para equipamentos:', error);
      // Removed error toast
      
      // Fallback para dados locais
      try {
        const checklistService = await import('./checklistService');
        const localData = checklistService.equipmentsList;
        console.log('Usando equipamentos locais:', localData);
        return localData;
      } catch (importError) {
        console.error('Erro ao importar dados locais:', importError);
        return [];
      }
    }
  } else {
    try {
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const currentApiUrl = getApiUrl();
      
      console.log(`Buscando equipamentos do servidor com timestamp: ${timestamp} e random: ${randomParam}`);
      console.log(`URL da API: ${currentApiUrl}`);
      
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
      // Removed error toast
      
      const { getEquipments } = await import('./checklistService');
      const localData = await getEquipments();
      console.log('Usando equipamentos locais:', localData);
      return localData;
    }
  }
};

// Obter operadores (IndexedDB ou PostgreSQL)
export const getOperatorsFromServer = async (forceRefresh = false): Promise<Operator[]> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Buscando operadores do IndexedDB');
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('operators', 'readonly');
        const store = transaction.objectStore('operators');
        const request = store.getAll();
        
        request.onsuccess = () => {
          const data = request.result;
          console.log('Operadores recebidos do IndexedDB:', data);
          
          if (data.length === 0 || forceRefresh) {
            // Se não houver dados no IndexedDB ou forceRefresh=true, usar dados locais
            import('./operatorsService').then(module => {
              module.getOperators().then(localData => {
                console.log('Carregando operadores locais para o IndexedDB:', localData);
                
                // Salvar dados locais no IndexedDB para uso futuro
                const saveTransaction = db.transaction('operators', 'readwrite');
                const saveStore = saveTransaction.objectStore('operators');
                
                // Limpar store antes de adicionar apenas se forceRefresh
                if (forceRefresh && data.length > 0) {
                  console.log('Limpando store de operadores antes de recarregar dados');
                  const clearRequest = saveStore.clear();
                  
                  clearRequest.onsuccess = () => {
                    console.log('Store de operadores limpo com sucesso');
                  };
                  
                  clearRequest.onerror = (e) => {
                    console.error('Erro ao limpar store de operadores:', e);
                  };
                }
                
                // Adicionar todos os operadores ao IndexedDB
                let addedCount = 0;
                localData.forEach(item => {
                  const addRequest = saveStore.add(item);
                  
                  addRequest.onsuccess = () => {
                    addedCount++;
                    if (addedCount === localData.length) {
                      console.log(`${addedCount} operadores adicionados ao IndexedDB`);
                    }
                  };
                  
                  addRequest.onerror = (event) => {
                    console.warn('Erro ao adicionar operador ao IndexedDB (pode já existir):', event);
                    // Ignorar erros individuais para continuar o processo
                  };
                });
                
                resolve(localData);
              });
            }).catch(err => {
              console.error('Erro ao importar dados locais de operadores:', err);
              reject(err);
            });
          } else {
            resolve(data);
          }
        };
        
        request.onerror = () => {
          console.error('Erro ao buscar operadores do IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao acessar IndexedDB para operadores:', error);
      // Removed error toast
      
      // Fallback para dados locais
      try {
        const operatorsService = await import('./operatorsService');
        const localData = await operatorsService.getOperators();
        console.log('Usando operadores locais:', localData);
        return localData;
      } catch (importError) {
        console.error('Erro ao importar dados locais de operadores:', importError);
        return [];
      }
    }
  } else {
    try {
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const currentApiUrl = getApiUrl();
      
      console.log(`Buscando operadores do servidor com timestamp: ${timestamp} e random: ${randomParam}`);
      
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
      // Removed error toast
      
      const { getOperators } = await import('./operatorsService');
      const localData = await getOperators();
      console.log('Usando operadores locais:', localData);
      return localData;
    }
  }
};

// Obter setores (IndexedDB ou PostgreSQL)
export const getSectorsFromServer = async (forceRefresh = false): Promise<Sector[]> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Buscando setores do IndexedDB');
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('sectors', 'readonly');
        const store = transaction.objectStore('sectors');
        const request = store.getAll();
        
        request.onsuccess = () => {
          const data = request.result;
          console.log('Setores recebidos do IndexedDB:', data);
          resolve(data);
        };
        
        request.onerror = () => {
          console.error('Erro ao buscar setores do IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao acessar IndexedDB para setores:', error);
      // Removed error toast
      return [];
    }
  } else {
    try {
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const currentApiUrl = getApiUrl();
      
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
      // Removed error toast
      return [];
    }
  }
};

// Obter histórico de checklists (IndexedDB ou PostgreSQL)
export const getChecklistHistoryFromServer = async (): Promise<ChecklistHistory[]> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Buscando histórico do IndexedDB');
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('checklists', 'readonly');
        const store = transaction.objectStore('checklists');
        const request = store.getAll();
        
        request.onsuccess = () => {
          const data = request.result.map((item: any) => ({
            id: item.id,
            equipmentId: item.equipmentNumber,
            equipmentName: item.equipment,
            operatorId: item.operatorId || '',
            operatorName: item.operatorName,
            sector: item.sector,
            date: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
            items: item.items,
            signature: item.signature
          }));
          
          console.log('Histórico recebido do IndexedDB:', data);
          resolve(data);
        };
        
        request.onerror = () => {
          console.error('Erro ao buscar histórico do IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao acessar IndexedDB para histórico:', error);
      // Removed error toast
      
      // Fallback para dados locais
      const { getChecklistHistory } = await import('./historyService');
      return getChecklistHistory();
    }
  } else {
    try {
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const currentApiUrl = getApiUrl();
      
      const response = await axios.get(`${currentApiUrl}/checklists/history?t=${timestamp}&r=${randomParam}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico do banco de dados:', error);
      // Removed error toast
      
      // Fallback para dados locais
      const { getChecklistHistory } = await import('./historyService');
      return getChecklistHistory();
    }
  }
};

// Sincronizar histórico local com o banco de dados
export const syncLocalHistoryWithServer = async (): Promise<void> => {
  try {
    const { getChecklistHistory } = await import('./historyService');
    const localHistory = getChecklistHistory();
    
    if (localHistory.length === 0) return;
    
    const currentApiUrl = getApiUrl();
    await axios.post(`${currentApiUrl}/checklists/sync`, { checklists: localHistory });
    toast.success('Histórico local sincronizado com o banco de dados!');
  } catch (error) {
    console.error('Erro ao sincronizar histórico com banco de dados:', error);
    toast.error('Falha ao sincronizar dados com o servidor');
  }
};

// Verifica o status do PostgreSQL
export const getPostgresStatus = async () => {
  try {
    const apiUrl = getApiUrl();
    const response = await axios.get(`${apiUrl}/postgres-status`);
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar status do PostgreSQL:', error);
    return { status: 'error', message: 'Não foi possível verificar o status do PostgreSQL' };
  }
};

// Verifica o status do IndexedDB
export const getIndexedDBStatus = async () => {
  try {
    await initIndexedDB();
    return { status: 'ok', message: 'IndexedDB está funcionando corretamente' };
  } catch (error) {
    console.error('Erro ao verificar status do IndexedDB:', error);
    return { status: 'error', message: 'IndexedDB não está disponível ou houve um erro' };
  }
};

// Salvar equipamento no IndexedDB ou PostgreSQL
export const saveEquipmentToServer = async (equipment: Equipment): Promise<Equipment> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Salvando equipamento no IndexedDB:', equipment);
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('equipments', 'readwrite');
        const store = transaction.objectStore('equipments');
        
        // Verifica se já existe um equipamento com este ID
        const getRequest = store.get(equipment.id);
        
        getRequest.onsuccess = () => {
          const existingEquipment = getRequest.result;
          let saveRequest;
          
          if (existingEquipment) {
            // Se já existe, atualiza
            saveRequest = store.put(equipment);
          } else {
            // Se não existe, adiciona
            saveRequest = store.add(equipment);
          }
          
          saveRequest.onsuccess = () => {
            toast.success('Equipamento salvo no IndexedDB com sucesso!');
            resolve(equipment);
          };
          
          saveRequest.onerror = () => {
            toast.error('Falha ao salvar equipamento no IndexedDB');
            reject(saveRequest.error);
          };
        };
        
        getRequest.onerror = () => {
          toast.error('Falha ao verificar equipamento no IndexedDB');
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error('Erro ao salvar equipamento no IndexedDB:', error);
      toast.error('Falha ao salvar equipamento no IndexedDB');
      throw error;
    }
  } else {
    try {
      console.log('Salvando equipamento no servidor:', equipment);
      const response = await api.post('/equipments', equipment);
      toast.success('Equipamento salvo no banco de dados com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar equipamento no banco de dados:', error);
      toast.error('Falha ao salvar equipamento no banco de dados');
      throw error;
    }
  }
};

// Salvar operador no IndexedDB ou PostgreSQL
export const saveOperatorToServer = async (operator: Operator): Promise<Operator> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Salvando operador no IndexedDB:', operator);
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('operators', 'readwrite');
        const store = transaction.objectStore('operators');
        
        // Verifica se já existe um operador com este ID
        const getRequest = store.get(operator.id);
        
        getRequest.onsuccess = () => {
          const existingOperator = getRequest.result;
          let saveRequest;
          
          if (existingOperator) {
            // Se já existe, atualiza
            console.log('Atualizando operador existente:', operator.id);
            saveRequest = store.put(operator);
          } else {
            // Se não existe, adiciona
            console.log('Adicionando novo operador:', operator.id);
            saveRequest = store.add(operator);
          }
          
          saveRequest.onsuccess = () => {
            console.log('Operador salvo com sucesso:', operator);
            toast.success('Operador salvo no IndexedDB com sucesso!');
            resolve(operator);
          };
          
          saveRequest.onerror = (event) => {
            console.error('Falha ao salvar operador no IndexedDB:', event);
            toast.error('Falha ao salvar operador no IndexedDB');
            reject(saveRequest.error);
          };
        };
        
        getRequest.onerror = () => {
          toast.error('Falha ao verificar operador no IndexedDB');
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error('Erro ao salvar operador no IndexedDB:', error);
      toast.error('Falha ao salvar operador no IndexedDB');
      throw error;
    }
  } else {
    try {
      console.log('Salvando operador no servidor:', operator);
      const response = await api.post('/operators', operator);
      toast.success('Operador salvo no banco de dados com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar operador no banco de dados:', error);
      toast.error('Falha ao salvar operador no banco de dados');
      throw error;
    }
  }
};

// Remover equipamento do IndexedDB ou PostgreSQL
export const deleteEquipmentFromServer = async (id: string): Promise<void> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Removendo equipamento do IndexedDB:', id);
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('equipments', 'readwrite');
        const store = transaction.objectStore('equipments');
        const request = store.delete(id);
        
        request.onsuccess = () => {
          toast.success('Equipamento removido com sucesso!');
          resolve();
        };
        
        request.onerror = () => {
          toast.error('Falha ao remover equipamento');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao remover equipamento do IndexedDB:', error);
      toast.error('Falha ao remover equipamento do IndexedDB');
      throw error;
    }
  } else {
    try {
      console.log('Removendo equipamento do servidor:', id);
      await api.delete(`/equipments/${id}`);
      toast.success('Equipamento removido do banco de dados com sucesso!');
    } catch (error) {
      console.error('Erro ao remover equipamento do banco de dados:', error);
      toast.error('Falha ao remover equipamento do banco de dados');
      throw error;
    }
  }
};

// Remover operador do IndexedDB ou PostgreSQL
export const deleteOperatorFromServer = async (id: string): Promise<void> => {
  if (isUsingIndexedDB()) {
    try {
      console.log('Removendo operador do IndexedDB:', id);
      const db = await initIndexedDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('operators', 'readwrite');
        const store = transaction.objectStore('operators');
        const request = store.delete(id);
        
        request.onsuccess = () => {
          toast.success('Operador removido com sucesso!');
          resolve();
        };
        
        request.onerror = () => {
          toast.error('Falha ao remover operador');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Erro ao remover operador do IndexedDB:', error);
      toast.error('Falha ao remover operador do IndexedDB');
      throw error;
    }
  } else {
    try {
      console.log('Removendo operador do servidor:', id);
      await api.delete(`/operators/${id}`);
      toast.success('Operador removido do banco de dados com sucesso!');
    } catch (error) {
      console.error('Erro ao remover operador do banco de dados:', error);
      toast.error('Falha ao remover operador do banco de dados');
      throw error;
    }
  }
};
