/** All money in this app is an integer number of satang. 15000 = 150.00 THB. */

export function formatTHB(satang: number): string {
  return (satang / 100).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatTHBPlain(satang: number): string {
  return String(Math.round(satang / 100));
}
