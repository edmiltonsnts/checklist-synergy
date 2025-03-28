
export interface Checklist {
  id?: number;
  equipmentNumber: string;
  operatorName: string;
  equipment: string;
  kpNumber: string;
  sector: string;
  capacity: string;
  items: ChecklistItem[];
  signature?: string; // Campo para a assinatura do operador
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChecklistItem {
  id: number;
  question: string;
  answer: string | null;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  capacity: string;
  sector: string;
}
