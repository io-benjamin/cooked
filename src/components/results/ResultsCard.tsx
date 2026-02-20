'use client';

import { CookedResult } from '@/types/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getTierLabel } from '@/lib/scoring';

interface ResultsCardProps {
  result: CookedResult;
  onReset: () => void;
}

export function ResultsCard({ result, onReset }: ResultsCardProps) {
  const tierColors: Record<string, string> = {
    'raw': 'text-green-500',
    'medium-rare': 'text-lime-500',
    'medium': 'text-yellow-500',
    'well-done': 'text-orange-500',
    'charcoal': 'text-red-500',
    'ash': 'text-gray-500',
  };

  const tierBgColors: Record<string, string> = {
    'raw': 'bg-green-500/10 border-green-500/20',
    'medium-rare': 'bg-lime-500/10 border-lime-500/20',
    'medium': 'bg-yellow-500/10 border-yellow-500/20',
    'well-done': 'bg-orange-500/10 border-orange-500/20',
    'charcoal': 'bg-red-500/10 border-red-500/20',
    'ash': 'bg-gray-500/10 border-gray-500/20',
  };

  const handleShare = async () => {
    const text = `I'm ${result.score}% cooked (${getTierLabel(result.tier)} ${result.emoji})\n\n"${result.roast}"\n\nFind out if you're cooked: amicooked.com`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Score Card */}
      <Card className={`border-2 ${tierBgColors[result.tier]}`}>
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="text-8xl">{result.emoji}</div>
          
          <div>
            <div className={`text-6xl font-bold ${tierColors[result.tier]}`}>
              {result.score}%
            </div>
            <div className="text-2xl font-semibold text-muted-foreground mt-2">
              {getTierLabel(result.tier)}
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <p className="text-xl italic text-muted-foreground">
              "{result.roast}"
            </p>
          </div>

          <div className="pt-4">
            <div className="text-sm text-muted-foreground mb-2">
              Cooked-ness Level
            </div>
            <Progress value={result.score} className="h-4" />
          </div>
        </CardContent>
      </Card>

      {/* Ranking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How You Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span>All users</span>
            <span className="font-semibold">
              More cooked than {result.percentile}%
            </span>
          </div>
          {result.cityPercentile && (
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Your city</span>
              <span className="font-semibold">
                More cooked than {result.cityPercentile}%
              </span>
            </div>
          )}
          {result.industryPercentile && (
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Your industry</span>
              <span className="font-semibold">
                More cooked than {result.industryPercentile}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues Card */}
      {result.topIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What's Cooking You 🔥</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.topIssues.map((issue, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-lg border-l-4 ${
                  issue.severity === 'critical' ? 'border-l-red-500 bg-red-500/5' :
                  issue.severity === 'high' ? 'border-l-orange-500 bg-orange-500/5' :
                  issue.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-500/5' :
                  'border-l-blue-500 bg-blue-500/5'
                }`}
              >
                <div className="font-semibold">{issue.category}</div>
                <div className="text-sm text-muted-foreground">{issue.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations Card */}
      {result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Un-Cook Yourself 🧯</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  {rec.title}
                </div>
                <p className="text-sm text-muted-foreground pl-7">
                  {rec.description}
                </p>
                {rec.link && (
                  <a 
                    href={rec.link} 
                    className="text-sm text-primary hover:underline pl-7 block"
                  >
                    {rec.linkText}
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleShare}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          Share My Results 🔥
        </Button>
        <Button 
          variant="outline"
          onClick={onReset}
          className="flex-1"
        >
          Calculate Again
        </Button>
      </div>
    </div>
  );
}
