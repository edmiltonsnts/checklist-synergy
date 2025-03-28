
export interface Checklist {
  id?: number;
  equipmentNumber: string;
  operatorName: string;
  equipment: string;
  kpNumber: string;
  sector: string;
  capacity: string;
  items: ChecklistItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChecklistItem {
  id: number;
  question: string;
  answer: string | null;
}

// Estas interfaces podem ser expandidas conforme necessário para
// se adequarem ao seu esquema de banco de dados SQL Server
