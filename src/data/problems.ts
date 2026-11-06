import { Problem } from '../types';
import { p1UpiDuplicate } from './problems/p1_upi_duplicate';
import { p2DarkstoreWaste } from './problems/p2_darkstore_waste';
import { p3TopProductsTies } from './problems/p3_top_products_ties';
import { p4RiderStreak } from './problems/p4_rider_streak';
import { p5SaasNrr } from './problems/p5_saas_nrr';
import { p6RunningBalance } from './problems/p6_running_balance';
import { p7AdtechAttribution } from './problems/p7_adtech_attribution';
import { p8SurgeCancellation } from './problems/p8_surge_cancellation';
import { p9RollingSla } from './problems/p9_rolling_sla';
import { p10FunnelAbandonment } from './problems/p10_funnel_abandonment';
import { p11CircularMoneyRing } from './problems/p11_circular_money_ring';
import { p12SalaryCompression } from './problems/p12_salary_compression';

export const allProblems: Problem[] = [
  p1UpiDuplicate,
  p2DarkstoreWaste,
  p3TopProductsTies,
  p4RiderStreak,
  p5SaasNrr,
  p6RunningBalance,
  p7AdtechAttribution,
  p8SurgeCancellation,
  p9RollingSla,
  p10FunnelAbandonment,
  p11CircularMoneyRing,
  p12SalaryCompression,
];

export function getProblemById(id: string): Problem | undefined {
  return allProblems.find((p) => p.id === id);
}

export function getAllPatterns(): string[] {
  const set = new Set<string>();
  for (const p of allProblems) {
    for (const pat of p.patterns) {
      set.add(pat);
    }
  }
  return Array.from(set).sort();
}

export function getAllDomains(): string[] {
  const set = new Set<string>();
  for (const p of allProblems) {
    set.add(p.domain);
  }
  return Array.from(set).sort();
}
