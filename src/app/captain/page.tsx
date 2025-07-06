'use client';
import PlayerProfile from '@/app/components/player-profile';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, Handshake } from 'lucide-react';

const reputationTiers: Record<string, { label: string; color: string; progressColor: string }> = {
    Hated: { label: 'Hated', color: 'text-destructive', progressColor: 'from-red-600 to-destructive' },
    Disliked: { label: 'Disliked', color: 'text-orange-400', progressColor: 'from-orange-500 to-orange-400' },
    Neutral: { label: 'Neutral', color: 'text-muted-foreground', progressColor: 'from-gray-500 to-gray-400' },
    Liked: { label: 'Liked', color: 'text-sky-400', progressColor: 'from-sky-500 to-sky-400' },
    Honored: { label: 'Honored', color: 'text-primary', progressColor: 'from-blue-500 to-primary' },
};

function getReputationTier(score: number) {
    if (score <= -75) return reputationTiers.Hated;
    if (score <= -25) return reputationTiers.Disliked;
    if (score < 25) return reputationTiers.Neutral;
    if (score < 75) return reputationTiers.Liked;
    return reputationTiers.Honored;
}


export default function CaptainPage() {
  const { gameState, handleGenerateAvatar, isGeneratingAvatar, handleGenerateBio, isGeneratingBio, setPlayerName } = useGame();

  if (!gameState) {
    return null; 
  }

  const { playerStats } = gameState;
  
  const leaderboardRank = gameState.leaderboard.find(e => e.trader === playerStats.name)?.rank || gameState.leaderboard.length;

  const reputationInfo = getReputationTier(playerStats.reputation);
  const reputationProgress = ((playerStats.reputation + 100) / 200) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
         <PlayerProfile
            stats={playerStats}
            onGenerateAvatar={handleGenerateAvatar}
            isGeneratingAvatar={isGeneratingAvatar}
            onGenerateBio={handleGenerateBio}
            isGeneratingBio={isGeneratingBio}
            onNameChange={setPlayerName}
          />
      </div>
      <div className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                      <Coins className="text-primary"/>
                      Finances
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Net Worth</span>
                      <span className="font-mono text-amber-300">{playerStats.netWorth.toLocaleString()} ¢</span>
                  </div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                      <Trophy className="text-primary"/>
                      Ranking
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Global Rank</span>
                      <span className="font-mono text-primary">#{leaderboardRank}</span>
                  </div>
                   <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Prestige Score</span>
                      <span className="font-mono text-primary">{(playerStats.netWorth / 1000).toFixed(0)}</span>
                  </div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                      <Handshake className="text-primary"/>
                      Reputation
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Galactic Standing</span>
                      <span className={`font-mono font-bold ${reputationInfo.color}`}>{reputationInfo.label}</span>
                  </div>
                   <div>
                       <Progress value={reputationProgress} className="h-2 [&>div]:bg-gradient-to-r" indicatorClassName={reputationInfo.progressColor} />
                       <div className="flex justify-between text-xs text-muted-foreground mt-1">
                           <span>Hated</span>
                           <span>Neutral</span>
                           <span>Honored</span>
                       </div>
                   </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
