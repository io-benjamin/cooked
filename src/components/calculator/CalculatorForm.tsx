'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CITY_OPTIONS } from '@/data/cities';
import { INDUSTRY_OPTIONS, EXPERIENCE_LEVELS, LIVING_ARRANGEMENTS } from '@/data/industries';
import { UserInputs } from '@/types/calculator';

interface CalculatorFormProps {
  onSubmit: (inputs: UserInputs) => void;
  isLoading?: boolean;
}

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <CardTitle>Let's get to know you</CardTitle>
            <CardDescription>Basic info to personalize your results</CardDescription>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">How old are you?</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  min={18}
                  max={80}
                  value={inputs.age || ''}
                  onChange={(e) => updateInput('age', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>What city do you live in?</Label>
                <Select value={inputs.city} onValueChange={(v) => updateInput('city', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITY_OPTIONS.map(city => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What industry do you work in?</Label>
                <Select value={inputs.industry} onValueChange={(v) => updateInput('industry', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map(ind => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience level?</Label>
                <Select value={inputs.experienceLevel} onValueChange={(v) => updateInput('experienceLevel', v as UserInputs['experienceLevel'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job title (optional)</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer"
                  value={inputs.jobTitle || ''}
                  onChange={(e) => updateInput('jobTitle', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <CardTitle>Let's talk money 💰</CardTitle>
            <CardDescription>Your income (we won't judge... much)</CardDescription>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="income">Annual income (before taxes)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="income"
                    type="number"
                    className="pl-7"
                    placeholder="65,000"
                    value={inputs.annualIncome || ''}
                    onChange={(e) => updateInput('annualIncome', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideIncome">Side hustle income (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="sideIncome"
                    type="number"
                    className="pl-7"
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
          <div className="space-y-4">
            <CardTitle>Housing situation 🏠</CardTitle>
            <CardDescription>Where that paycheck goes first</CardDescription>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Monthly rent/mortgage</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="rent"
                    type="number"
                    className="pl-7"
                    placeholder="1,500"
                    value={inputs.monthlyRent || ''}
                    onChange={(e) => updateInput('monthlyRent', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Living arrangement</Label>
                <Select value={inputs.livingArrangement} onValueChange={(v) => updateInput('livingArrangement', v as UserInputs['livingArrangement'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrangement" />
                  </SelectTrigger>
                  <SelectContent>
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
          <div className="space-y-4">
            <CardTitle>The debt section 😬</CardTitle>
            <CardDescription>Don't worry, we've all been there</CardDescription>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentLoans">Student loan balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="studentLoans"
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    value={inputs.studentLoans ?? ''}
                    onChange={(e) => updateInput('studentLoans', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditCard">Credit card debt</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="creditCard"
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    value={inputs.creditCardDebt ?? ''}
                    onChange={(e) => updateInput('creditCardDebt', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carLoan">Car loan balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="carLoan"
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    value={inputs.carLoan ?? ''}
                    onChange={(e) => updateInput('carLoan', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherDebt">Other debt (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="otherDebt"
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    value={inputs.otherDebt || ''}
                    onChange={(e) => updateInput('otherDebt', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <CardTitle>Savings check 💰</CardTitle>
            <CardDescription>The rainy day fund situation</CardDescription>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="savings">Total savings (checking + savings)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="savings"
                    type="number"
                    className="pl-7"
                    placeholder="5,000"
                    value={inputs.totalSavings ?? ''}
                    onChange={(e) => updateInput('totalSavings', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retirement">Retirement savings (401k, IRA)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="retirement"
                    type="number"
                    className="pl-7"
                    placeholder="10,000"
                    value={inputs.retirementSavings ?? ''}
                    onChange={(e) => updateInput('retirementSavings', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investments">Other investments (optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="investments"
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    value={inputs.investments || ''}
                    onChange={(e) => updateInput('investments', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <CardTitle>Final question 📊</CardTitle>
            <CardDescription>Optional but helps with accuracy</CardDescription>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit score (optional)</Label>
                <Input
                  id="creditScore"
                  type="number"
                  placeholder="720"
                  min={300}
                  max={850}
                  value={inputs.creditScore || ''}
                  onChange={(e) => updateInput('creditScore', parseInt(e.target.value) || undefined)}
                />
                <p className="text-xs text-muted-foreground">Enter a number between 300-850, or leave blank</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
          >
            Back
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLoading ? 'Calculating...' : '🔥 Am I Cooked?'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
