export type ExpenseRecord = {
  id: string;
  paidByUserId: string;
  amount: number;
  splitAmong: string[] | null; // null = all participants
};

export type Transfer = {
  from: string;
  to: string;
  amount: number;
};

/**
 * Compute the minimum set of transfers to settle all expenses.
 * Uses a greedy algorithm: repeatedly match the largest debtor with the largest creditor.
 */
export function computeSplit(
  expenses: ExpenseRecord[],
  participantIds: string[],
): Transfer[] {
  // Net balance per person: positive = owed money (creditor), negative = owes money (debtor)
  const balance: Record<string, number> = {};
  for (const id of participantIds) balance[id] = 0;

  for (const expense of expenses) {
    const splitIds =
      expense.splitAmong && expense.splitAmong.length > 0
        ? expense.splitAmong.filter((id) => participantIds.includes(id))
        : participantIds;

    const share = expense.amount / splitIds.length;

    // Payer gains credit
    if (balance[expense.paidByUserId] !== undefined) {
      balance[expense.paidByUserId] += expense.amount;
    }
    // Each person in the split owes their share
    for (const id of splitIds) {
      if (balance[id] !== undefined) {
        balance[id] -= share;
      }
    }
  }

  // Separate into creditors (positive) and debtors (negative)
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, net] of Object.entries(balance)) {
    if (net > 0.005) creditors.push({ id, amount: net });
    else if (net < -0.005) debtors.push({ id, amount: -net });
  }

  // Sort descending by amount for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const settled = Math.min(creditor.amount, debtor.amount);

    transfers.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(settled * 100) / 100,
    });

    creditor.amount -= settled;
    debtor.amount -= settled;

    if (creditor.amount < 0.005) ci++;
    if (debtor.amount < 0.005) di++;
  }

  return transfers;
}
