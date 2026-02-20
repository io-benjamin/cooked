'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CITY_OPTIONS } from '@/data/cities';
import { INDUSTRY_OPTIONS, EXPERIENCE_LEVELS, LIVING_ARRANGEMENTS } from '@/data/industries';
import { UserInputs } from '@/types/calculator';

interface CalculatorFormProps {
  onSubmit: (inputs: UserInputs) => void;
  isLoading?: boolean;
}

const STEP_EMOJIS = ['👤', '💰', '🏠', '💳', '🏦', '📊'];
const STEP_TITLES = [
  'About You',
  'Income',
  'Housing',
  'Debt',
  'Savings',
  'Credit Score'
];

export function CalculatorForm({ onSubmit, isLoading }: CalculatorFormProps) {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<Partial<UserInputs>>({});

  const updateInput = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(inputs as UserInputs);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return inputs.age && inputs.city && inputs.industry && inputs.experienceLevel;
      case 2:
        return inputs.annualIncome !== undefined;
      case 3:
        return inputs.monthlyRent !== undefined && inputs.livingArrangement;
      case 4:
        return inputs.studentLoans !== undefined && inputs.creditCardDebt !== undefined && inputs.carLoan !== undefined;
      case 5:
        return inputs.totalSavings !== undefined && inputs.retirementSavings !== undefined;
      default:
        return true;
    }
  };

  const totalSteps = 6;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-between mb-8 px-4">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${
                i + 1 < step 
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' 
                  : i + 1 === step 
                    ? 'bg-white/10 border-2 border-orange-500 text-white scale-110' 
                    : 'bg-white/5 text-white/30'
              }`}
            >
              {i + 1 < step ? '✓' : STEP_EMOJIS[i]}
            </div>
            <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-white' : 'text-white/30'}`}>
              {STEP_TITLES[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="glass rounded-3xl p-8 space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">👤</span>
              <h3 className="text-2xl font-bold">Let's get to know you</h3>
              <p className="text-white/50 text-sm">Basic info to personalize your results</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Age</Label>
                <Input
                  type="number"
                  placeholder="25"
                  min={18}
                  max={80}
                  value={inputs.age || ''}
                  onChange={(e) => updateInput('age', parseInt(e.target.value) || 0)}
                  className="h-14 text-lg bg-white/5 border-white/10 rounded-xl focus:border-orange-500 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">City</Label>
                <Select value={inputs.city} onValueChange={(v) => updateInput('city', v)}>
                  <SelectTrigger className="h-14 text-lg bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    {CITY_OPTIONS.map(city => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Industry</Label>
                <Select value={inputs.industry} onValueChange={(v) => updateInput('industry', v)}>
                  <SelectTrigger className="h-14 text-lg bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    {INDUSTRY_OPTIONS.map(ind => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Experience Level</Label>
                <Select value={inputs.experienceLevel} onValueChange={(v) => updateInput('experienceLevel', v as UserInputs['experienceLevel'])}>
                  <SelectTrigger className="h-14 text-lg bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    {EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">💰</span>
              <h3 className="text-2xl font-bold">Show me the money</h3>
              <p className="text-white/50 text-sm">We won't judge... much</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Annual income (before taxes)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="65,000"
                    value={inputs.annualIncome || ''}
                    onChange={(e) => updateInput('annualIncome', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Side income (optional)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="0"
                    value={inputs.sideIncome || ''}
                    onChange={(e) => updateInput('sideIncome', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🏠</span>
              <h3 className="text-2xl font-bold">Housing situation</h3>
              <p className="text-white/50 text-sm">Where that paycheck goes first</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Monthly rent/mortgage</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="1,500"
                    value={inputs.monthlyRent || ''}
                    onChange={(e) => updateInput('monthlyRent', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Living arrangement</Label>
                <Select value={inputs.livingArrangement} onValueChange={(v) => updateInput('livingArrangement', v as UserInputs['livingArrangement'])}>
                  <SelectTrigger className="h-14 text-lg bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Select arrangement" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    {LIVING_ARRANGEMENTS.map(arr => (
                      <SelectItem key={arr.value} value={arr.value}>
                        {arr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">💳</span>
              <h3 className="text-2xl font-bold">The debt section</h3>
              <p className="text-white/50 text-sm">Don't worry, we've all been there 😬</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Student loans</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="0"
                    value={inputs.studentLoans ?? ''}
                    onChange={(e) => updateInput('studentLoans', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Credit card debt</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="0"
                    value={inputs.creditCardDebt ?? ''}
                    onChange={(e) => updateInput('creditCardDebt', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Car loan</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="0"
                    value={inputs.carLoan ?? ''}
                    onChange={(e) => updateInput('carLoan', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🏦</span>
              <h3 className="text-2xl font-bold">Savings check</h3>
              <p className="text-white/50 text-sm">The rainy day fund situation</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Total savings (checking + savings)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="5,000"
                    value={inputs.totalSavings ?? ''}
                    onChange={(e) => updateInput('totalSavings', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Retirement savings (401k, IRA)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-lg">$</span>
                  <Input
                    type="number"
                    className="h-14 text-lg pl-8 bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                    placeholder="10,000"
                    value={inputs.retirementSavings ?? ''}
                    onChange={(e) => updateInput('retirementSavings', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">📊</span>
              <h3 className="text-2xl font-bold">Final question</h3>
              <p className="text-white/50 text-sm">Optional but helps with accuracy</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Credit score (optional)</Label>
                <Input
                  type="number"
                  className="h-14 text-lg bg-white/5 border-white/10 rounded-xl focus:border-orange-500"
                  placeholder="720"
                  min={300}
                  max={850}
                  value={inputs.creditScore || ''}
                  onChange={(e) => updateInput('creditScore', parseInt(e.target.value) || undefined)}
                />
                <p className="text-xs text-white/30">300-850, or leave blank if unknown</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            ← Back
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 h-12 rounded-xl disabled:opacity-30"
            >
              Continue →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 h-12 rounded-xl animate-pulse-glow"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Calculating...
                </span>
              ) : (
                '🔥 Am I Cooked?'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
