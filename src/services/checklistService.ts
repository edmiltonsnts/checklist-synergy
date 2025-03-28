
import { Checklist, ChecklistItem, Equipment } from '@/types/checklist';

// Simulação da lista de equipamentos baseada na imagem fornecida
export const equipmentsList: Equipment[] = [
  { id: '207', name: 'Ponte 01', type: '1', capacity: '10 tons', sector: 'MOLDAGEM' },
  { id: '409', name: 'Ponte 02', type: '1', capacity: '10 tons', sector: 'DESMOLDAGEM' },
  { id: '389', name: 'Ponte 03', type: '1', capacity: '5 tons', sector: 'EXPEDIÇÃO' },
  { id: '412', name: 'Ponte 04', type: '1', capacity: '3 tons', sector: 'FUSÃO' },
  { id: '322', name: 'Ponte 05', type: '1', capacity: '1 ton', sector: 'EXPEDIÇÃO' },
  { id: '1092', name: 'Ponte 06', type: '1', capacity: '5 tons', sector: 'TRATAMENTO TÉRMICO' },
  { id: '323', name: 'Ponte 07', type: '1', capacity: '5 e 16 tons', sector: 'LINHA DE MOLDAGEM E FECHAMENTO' },
  { id: '1325', name: 'Ponte 08', type: '1', capacity: '8 tons', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '1326', name: 'Ponte 09', type: '1', capacity: '10 tons', sector: 'FUSÃO' },
  { id: '1327', name: 'Ponte 10', type: '1', capacity: '2 tons', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '1270', name: 'Ponte 11', type: '1', capacity: '2 tons', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '215', name: 'Ponte 12', type: '1', capacity: '1 ton', sector: 'MACHARIA' },
  { id: '1804', name: 'Ponte 13', type: '1', capacity: '2 tons', sector: 'LINHA DE MOLDAGEM E FECHAMENTO' },
  { id: '2686', name: 'Ponte 14', type: '1', capacity: '2 tons', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '3031', name: 'Ponte 15', type: '1', capacity: '10 tons', sector: 'FUSÃO' },
  { id: '3234', name: 'Ponte 16', type: '1', capacity: '2 tons', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '3283', name: 'Ponte 17', type: '1', capacity: '4 tons', sector: 'LINHA DE MOLDAGEM E FECHAMENTO' },
  { id: '3285', name: 'Ponte 18', type: '1', capacity: '1 ton', sector: 'MOLDAGEM' },
  { id: '5846', name: 'Ponte 19', type: '1', capacity: '8 tons', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '6038', name: 'Ponte 20', type: '1', capacity: '10 tons', sector: 'LINHA DE MOLDAGEM E FECHAMENTO' },
  { id: '6108', name: 'Ponte 21', type: '1', capacity: '2,5 tons', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '352', name: 'Talha 19', type: '2', capacity: '2 tons', sector: 'SUCATA' },
  { id: '375', name: 'Talha 23', type: '2', capacity: '1 ton', sector: 'DESMOLDAGEM' },
  { id: '3336', name: 'Pórtico 01', type: '3', capacity: '5 tons', sector: 'SUCATA' },
  { id: '909', name: 'Talha 11', type: '2', capacity: '2 tons', sector: 'FUSÃO' }
];

// Simulando uma chamada de API para salvar no SQL Server
export const saveChecklist = async (checklist: Checklist): Promise<Checklist> => {
  // Simulando uma chamada de API para salvar no SQL Server
  console.log('Enviando dados para o SQL Server:', checklist);
  
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Em uma implementação real, você faria uma chamada fetch ou axios para seu backend
  // E retornaria a resposta do servidor
  
  return {
    ...checklist,
    id: Math.floor(Math.random() * 1000), // Simulando um ID gerado pelo banco
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const getEquipmentById = (id: string): Equipment | undefined => {
  return equipmentsList.find(equip => equip.id === id);
};

export const getEquipments = async (): Promise<Equipment[]> => {
  // Simulando uma busca de equipamentos do banco de dados
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return equipmentsList;
};

export const getOperators = async (): Promise<{id: string, name: string}[]> => {
  // Simulando uma busca de operadores do banco de dados
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    { id: '1', name: 'MABEL KRISTINE BRAMORSKI LON' },
    { id: '2', name: 'JOÃO SILVA' },
    { id: '3', name: 'CARLOS PEREIRA' },
    { id: '4', name: 'MARIA OLIVEIRA' }
  ];
};
