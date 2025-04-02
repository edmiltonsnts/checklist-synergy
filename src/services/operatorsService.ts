
import { Operator } from '@/types/checklist';

// Lista de operadores baseada no Excel fornecido
export const operatorsList: Operator[] = [
  { id: '1260', name: 'VALDAIR LAURENTINO', role: 'OPER. PRODUÇÃO MACHARIA III', sector: 'MACHARIA' },
  { id: '1325', name: 'GILMAR OTEMBRAIT', role: 'INSPETOR QUALIDADE II', sector: 'CONTROLE DE QUALIDADE' },
  { id: '1329', name: 'GEISON CRISTIANO SCHEL', role: 'OPER MAQ MOLD FECH II', sector: 'LINHA DE MOLDAGEM E FECHAMENTO' },
  { id: '1363', name: 'FELIPE DALLABONA', role: 'ANALISTA DE PPCP II', sector: 'PROGRAMÇAO PROD.' },
  { id: '1372', name: 'ADEMAR GESSER', role: 'OP. REBARBAÇÃO (OP. ACAB.)III', sector: 'REBOLO PENDULAR' },
  { id: '1377', name: 'CELSO DA SILVA PEREIRA', role: 'TÉCNICO EM SEGURANÇA DO TRABALHO II', sector: 'SEG. MEDICINA TRABA.' },
  { id: '1382', name: 'SILVERIO BISATTO', role: 'SOLDADOR II', sector: 'SOLDA' },
  { id: '1413', name: 'FABRICIO DALLABONA', role: 'ENCAR. DE PROD. ACABAMENTO II', sector: 'ACABAMENTO DE PEÇAS (I)' },
  { id: '1422', name: 'JOSE MARINO REICHERT', role: 'OP. REBARBAÇÃO (OP. ACAB.)III', sector: 'REBOLO PENDULAR' },
  { id: '1423', name: 'JOSE PEREIRA', role: 'INSPETOR QUALIDADE IV', sector: 'CONTROLE DE QUALIDADE' },
  { id: '1429', name: 'EDILSON NEVES MOTTA', role: 'INSPETOR QUALIDADE II', sector: 'CONTROLE DE QUALIDADE' },
  { id: '1430', name: 'REGINALDO VALERIANO DOS SANTOS', role: 'OP. COR. CANAL (MAÇARIQ.) III', sector: 'CORTE DE CANAL MAÇARICO' },
  { id: '1437', name: 'ANDERSON LUIS ONEDA', role: 'MODELADOR III', sector: 'MODELARIA' },
  { id: '1446', name: 'JOAO CARLOS VANELLI', role: 'OP. COR. CANAL (MAÇARIQ.) III', sector: 'CORTE DE CANAL MAÇARICO' },
  { id: '1463', name: 'RAFAEL CLEMENTE ESPIG', role: 'OPER. PRODUÇÃO MACHARIA III', sector: 'MACHARIA' },
  { id: '1475', name: 'MARCELO RAMOS', role: 'MECÂNICO MANUTENÇÃO III', sector: 'MANUTENÇAO MECANICA' },
  { id: '1478', name: 'ADENOR REICHELT', role: 'OPER. DE FORNO A INDUÇÃO III', sector: 'FUSAO' },
  { id: '1479', name: 'ADELSIO REICHELT', role: 'REFRATARISTA II', sector: 'FUSAO' },
  { id: '1488', name: 'EDIVAN VELOZO', role: 'INSPETOR QUALIDADE II', sector: 'CONTROLE DE QUALIDADE' },
  { id: '1493', name: 'ROBERTO CARLOS PEREIRA', role: 'OPER. PRODUÇÃO MACHARIA III', sector: 'MACHARIA' },
  { id: '1501', name: 'EDELBERTO CARLOS GESSER', role: 'OPERADOR PONTE ROLANTE II', sector: 'ACABAMENTO DE PEÇAS' },
  { id: '1508', name: 'OSNI REICHERT', role: 'INSPETOR QUALIDADE II', sector: 'CONTROLE DE QUALIDADE' },
  { id: '1514', name: 'MAURICIO MELCHIORETTO', role: 'ANALISTA DE PROCESSOS TÉCNICO I', sector: 'DEP. TÉCNICO' },
  { id: '1200', name: 'MABEL KRISTINE BRAMORSKI LONGEN', role: 'MEDICO(A) TRABALHO', sector: 'SEG. MEDICINA TRABA.' },
  { id: '1536', name: 'VALDEMIRO LEPINSKI', role: 'MECÂNICO MANUTENÇÃO II', sector: 'MANUTENÇAO MECANICA' },
  { id: '1543', name: 'GUILHERME LEMKE', role: 'SUPERVISOR DE USINAGEM', sector: 'USINAGEM (I)' },
  { id: '1546', name: 'EDERSON SCABURRI', role: 'LIDER DA ELETROMECANICA', sector: 'MANUTENÇAO ELETRICA' },
  { id: '1549', name: 'SAMUEL FELIPE KREHNKE', role: 'MECÂNICO MANUTENÇÃO II', sector: 'MANUTENÇAO MECANICA' },
  { id: '1552', name: 'JAIME LEPINSKI', role: 'TORNEIRO MEC. (OPER. USI.)I', sector: 'USINAGEM' },
  { id: '1567', name: 'ALANO COSTA BATISTA', role: 'OPERADOR DE FORNO A INDUÇÃO II', sector: 'FUSAO' },
  { id: '1575', name: 'FABIANO SIGNORELLI', role: 'OPER.TRATAMENTO TÉRMICO I', sector: 'TRATAMENTO TÉRMICO' },
  { id: '1592', name: 'ANDERSON DA CUNHA', role: 'SOLDADOR II', sector: 'SOLDA' },
  { id: '1607', name: 'JOCEMAR ROSA DOS SANTOS', role: 'OPER. PRODUÇÃO MACHARIA III', sector: 'MOLDAGEM COLDBOX' },
  { id: '1618', name: 'ROSALVO MACHADO', role: 'SOLDADOR III', sector: 'SOLDA' },
  { id: '1638', name: 'LEONARDO SCHUTZ SCHAUSS', role: 'OP. DE ESCARFAGEM (OP. ACB)II', sector: 'ESCARFAGEM' },
  { id: '1694', name: 'LUIS ANTONIO PEREIRA DO NASCIMENTO', role: 'ALMOXARIFE DE MODELOS I', sector: 'PROGRAMÇAO PROD.' },
  { id: '1739', name: 'EDJALMA RICARDO MARIANO', role: 'OPER. PRODUÇÃO MACHARIA III', sector: 'MACHARIA' },
  { id: '1757', name: 'WALLACE ALVES DE JESUS', role: 'OPER PROD MOLD FECH III', sector: 'LINHA DE MOLDAGEM E FECHAMENTO' },
  { id: '1760', name: 'ELOIR RAMALHO', role: 'INSP. QUALIDADE DIMENSIONAL II', sector: 'CONTROLE DE QUALIDADE DIMENSIONAL' },
  { id: '1776', name: 'JOAO CARLOS RODRIGUES', role: 'OPER. DE JATO (OPER. ACAB.)II', sector: 'ROTOJATO' },
  { id: '1782', name: 'ALTOIR FERNANDES DA SILVA', role: 'OPER. PRODUÇÃO MACHARIA III', sector: 'MOLDAGEM COLDBOX' }
];

// Número total de operadores seria muito grande, então adicionamos apenas uma parte representativa

/**
 * Obtém todos os operadores ordenados alfabeticamente
 */
export const getOperators = async (): Promise<Operator[]> => {
  // Simulando uma busca de operadores do banco de dados
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Retorna operadores ordenados por nome
  return [...operatorsList].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Obtém um operador pelo ID
 */
export const getOperatorById = (id: string): Operator | undefined => {
  return operatorsList.find(operator => operator.id === id);
};

/**
 * Pesquisa operadores por nome, ID ou setor
 */
export const searchOperators = (query: string): Operator[] => {
  if (!query || query.trim() === '') {
    return [...operatorsList].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  const filteredOperators = operatorsList.filter(operator => 
    operator.name.toLowerCase().includes(searchTerm) || 
    operator.id.toLowerCase().includes(searchTerm) || 
    operator.sector.toLowerCase().includes(searchTerm) ||
    operator.role.toLowerCase().includes(searchTerm)
  );
  
  // Retorna os resultados ordenados por nome
  return filteredOperators.sort((a, b) => a.name.localeCompare(b.name));
};
