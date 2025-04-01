
import { ChecklistHistory, Checklist, ChecklistItem } from '@/types/checklist';
import { toast } from 'sonner';

// Simula o armazenamento no localStorage
const STORAGE_KEY = 'checklist_history';

export const saveChecklistToHistory = (checklist: Checklist): void => {
  try {
    const history = getChecklistHistory();
    
    const newEntry: ChecklistHistory = {
      id: `${Date.now()}`,
      equipmentId: checklist.equipmentNumber,
      equipmentName: checklist.equipment,
      operatorId: checklist.operatorId || '',
      operatorName: checklist.operatorName,
      sector: checklist.sector,
      date: new Date().toISOString(),
      items: checklist.items,
      signature: checklist.signature
    };
    
    history.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    
  } catch (error) {
    console.error('Erro ao salvar checklist no histórico:', error);
    toast.error('Erro ao salvar checklist no histórico');
  }
};

export const getChecklistHistory = (): ChecklistHistory[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Erro ao obter histórico de checklists:', error);
    return [];
  }
};

export const clearChecklistHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  toast.success('Histórico de checklists limpo com sucesso');
};

export const exportToJson = (data: any): void => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso');
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    toast.error('Erro ao exportar dados');
  }
};

export const importFromJson = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          const data = JSON.parse(event.target.result as string);
          resolve(data);
          toast.success('Dados importados com sucesso');
        } else {
          throw new Error('Falha ao ler o arquivo');
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        toast.error('Erro ao importar dados. Formato inválido');
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Erro ao ler o arquivo:', error);
      toast.error('Erro ao ler o arquivo');
      reject(error);
    };
    
    reader.readAsText(file);
  });
};
