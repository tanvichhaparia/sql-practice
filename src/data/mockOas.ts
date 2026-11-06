import { MockOA } from '../types';

export const mockOas: MockOA[] = [
  {
    id: 'oa_flipkart_meesho_ba',
    title: 'Flipkart & Meesho E-Commerce Business Analyst OA',
    company: 'Flipkart / Meesho',
    role: 'Business Analyst / Analytics Specialist',
    durationMinutes: 45,
    problemIds: ['p2_darkstore_inventory_waste', 'p3_top_products_ties', 'p4_rider_ontime_streak'],
    isPro: false,
    description:
      'A high-signal 3-question assessment simulating real e-commerce & quick commerce interview test rounds. Covers zero-order outer joins, dense ranking ties with net refunds, and delivery streak gap analysis.',
    targetSLA: 'Score 3/3 with 100% hidden edge-case coverage within 45 minutes.',
  },
  {
    id: 'oa_razorpay_phonepe_fintech',
    title: 'Razorpay & PhonePe Fintech Data Analyst OA',
    company: 'Razorpay / PhonePe',
    role: 'Data Analyst II (Risk & Payment Intelligence)',
    durationMinutes: 45,
    problemIds: ['p1_upi_duplicate_payout', 'p6_running_balance_overdraft', 'p11_circular_money_ring'],
    isPro: true,
    description:
      'Challenging fintech assessment testing transaction idempotency, ledger overdraft timestamps with millisecond tie-breakers, and circular money laundering detection via self-joins.',
    targetSLA: 'Score 3/3 with 100% hidden edge-case coverage within 45 minutes.',
  },
  {
    id: 'oa_swiggy_zepto_ops',
    title: 'Swiggy & Zepto Operations & Growth Analytics OA',
    company: 'Swiggy / Zepto',
    role: 'Senior Growth & Operations Analyst',
    durationMinutes: 45,
    problemIds: ['p4_rider_ontime_streak', 'p8_surge_cancellation_rate', 'p9_rolling_sla_breach'],
    isPro: true,
    description:
      'Hyperlocal operations assessment testing rider loyalty streaks, hourly surge cancellation percentages, and 3-day rolling window delivery SLA breaches.',
    targetSLA: 'Score 3/3 with 100% hidden edge-case coverage within 45 minutes.',
  },
];
