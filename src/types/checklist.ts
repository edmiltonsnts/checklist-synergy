
export interface Checklist {
  id?: number;
  equipmentNumber: string;
  operatorName: string;
  operatorId?: string;
  equipment: string;
  kpNumber: string; // Agora este campo será preenchido automaticamente com o ID do equipamento
  sector: string;
  capacity: string;
  items: ChecklistItem[];
  signature?: string;
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

export interface Operator {
  id: string;
  name: string;
  role: string;
  sector: string;
}
