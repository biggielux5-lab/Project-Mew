/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiceRank, DICE_VALUES } from '../data/rulesData';
import { DiceRollResult } from '../types';

export function rollDice(rank: DiceRank): number {
  const max = DICE_VALUES[rank] || 6;
  return Math.floor(Math.random() * max) + 1;
}

export function executeSkillTest(params: {
  rollerName: string;
  testName: string;
  attributeName: string;
  attributeDice: DiceRank;
  skillName: string;
  skillDice: DiceRank;
  bonus: number; // +2 for advantage, -2 for complication, etc.
  targetCa: number;
}): DiceRollResult {
  const attrRoll = rollDice(params.attributeDice);
  const skillRoll = rollDice(params.skillDice);
  const total = attrRoll + skillRoll + params.bonus;

  let outcome: 'Sucesso Forte' | 'Sucesso' | 'Sucesso com Custo' | 'Falha';
  let details = '';

  if (total >= params.targetCa + 5) {
    outcome = 'Sucesso Forte';
    details = `Total ${total} supera CA ${params.targetCa} por 5 ou mais! O objetivo é alcançado com benefício adicional (rapidez, discrição ou economia de recurso).`;
  } else if (total >= params.targetCa) {
    outcome = 'Sucesso';
    details = `Total ${total} igualou ou superou a CA ${params.targetCa}. O objetivo é alcançado sem custo adicional.`;
  } else if (params.targetCa - total <= 2) {
    outcome = 'Sucesso com Custo';
    const missing = params.targetCa - total;
    details = `Faltou ${missing} ponto(s) para atingir CA ${params.targetCa}. O personagem avança, mas paga um custo anunciado (atraso, barulho, gasto de recurso ou complicação).`;
  } else {
    outcome = 'Falha';
    const missing = params.targetCa - total;
    details = `Total ${total} ficou ${missing} pontos abaixo da CA ${params.targetCa}. O objetivo não foi alcançado e a situação muda com a consequência anunciada.`;
  }

  return {
    id: 'roll_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rollerName: params.rollerName,
    testName: params.testName,
    attributeName: params.attributeName,
    attributeDice: params.attributeDice,
    attributeRoll: attrRoll,
    skillName: params.skillName,
    skillDice: params.skillDice,
    skillRoll: skillRoll,
    bonus: params.bonus,
    total,
    targetCa: params.targetCa,
    outcome,
    details,
  };
}
