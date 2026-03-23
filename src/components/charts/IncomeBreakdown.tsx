'use client';

interface IncomeBreakdownProps {
  monthlyIncome: number;
  monthlyRent: number;
  monthlyDebtPayments: number;
  monthlySavings: number;
}

interface Slice {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export function IncomeBreakdown({
  monthlyIncome,
  monthlyRent,
  monthlyDebtPayments,
  monthlySavings,
}: IncomeBreakdownProps) {
  // Calculate percentages
  const rentPercent = Math.round((monthlyRent / monthlyIncome) * 100);
  const debtPercent = Math.round((monthlyDebtPayments / monthlyIncome) * 100);
  const savingsPercent = Math.round((monthlySavings / monthlyIncome) * 100);
  const livingPercent = Math.max(0, 100 - rentPercent - debtPercent - savingsPercent);

  const slices: Slice[] = [
    { label: 'Rent', value: monthlyRent, percent: rentPercent, color: '#f87171' },
    { label: 'Debt', value: monthlyDebtPayments, percent: debtPercent, color: '#fb923c' },
    { label: 'Savings', value: monthlySavings, percent: savingsPercent, color: '#4ade80' },
    { label: 'Living', value: monthlyIncome - monthlyRent - monthlyDebtPayments - monthlySavings, percent: livingPercent, color: '#60a5fa' },
  ].filter(s => s.percent > 0);

  // Build conic gradient
  let currentAngle = 0;
  const gradientStops = slices.map(slice => {
    const start = currentAngle;
    currentAngle += slice.percent * 3.6; // 3.6 degrees per percent
    return `${slice.color} ${start}deg ${currentAngle}deg`;
  }).join(', ');

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-black mb-6 flex items-center gap-3">
        <span className="text-2xl">💸</span>
        <span>Where Your Money Goes</span>
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative">
          <div
            className="w-48 h-48 rounded-full"
            style={{
              background: `conic-gradient(${gradientStops})`,
            }}
          >
            {/* Center hole */}
            <div className="absolute inset-6 rounded-full bg-[#0a0a0a] flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-black text-white">
                  ${Math.round(monthlyIncome).toLocaleString()}
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider">/ month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-white/70">{slice.label}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white">{slice.percent}%</span>
                <span className="text-white/40 text-sm ml-2">
                  ${Math.round(slice.value).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick insights */}
      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{rentPercent + debtPercent}%</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Fixed Costs</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: savingsPercent >= 20 ? '#4ade80' : savingsPercent >= 10 ? '#facc15' : '#f87171' }}>
            {savingsPercent}%
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider">Savings Rate</div>
        </div>
      </div>
    </div>
  );
}
