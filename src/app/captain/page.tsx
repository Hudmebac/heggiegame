'use client';
import PlayerProfile from '@/app/components/player-profile';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, Handshake } from 'lucide-react';

const reputationTiers: Record<string, { label: string; color: string; progressColor: string }> = {
    Outcast: { label: 'Outcast', color: 'text-destructive', progressColor: 'from-red-600 to-destructive' },
    Rookie: { label: 'Rookie', color: 'text-muted-foreground', progressColor: 'from-gray-500 to-gray-400' },
    Spacer: { label: 'Spacer', color: 'text-sky-400', progressColor: 'from-sky-500 to-sky-400' },
    Broker: { label: 'Broker', color: 'text-blue-400', progressColor: 'from-blue-500 to-blue-400' },
    Strategist: { label: 'Strategist', color: 'text-indigo-400', progressColor: 'from-indigo-500 to-indigo-400' },
    Magnate: { label: 'Magnate', color: 'text-purple-400', progressColor: 'from-purple-500 to-purple-400' },
    'Galactic Syndicate': { label: 'Galactic Syndicate', color: 'text-primary', progressColor: 'from-amber-400 to-primary' },
};

function getReputationTier(score: number) {
    if (score < 0) return reputationTiers.Outcast;
    if (score < 20) return reputationTiers.Rookie;
    if (score < 40) return reputationTiers.Spacer;
    if (score < 60) return reputationTiers.Broker;
    if (score < 80) return reputationTiers.Strategist;
    if (score < 100) return reputationTiers.Magnate;
    return reputationTiers['Galactic Syndicate'];
}


export default function CaptainPage() {
  const { gameState, handleGenerateAvatar, isGeneratingAvatar, handleGenerateBio, isGeneratingBio, setPlayerName } = useGame();

  if (!gameState) {
    return null; 
  }

  const { playerStats } = gameState;
  
  const leaderboardRank = gameState.leaderboard.find(e => e.trader === playerStats.name)?.rank || gameState.leaderboard.length;

  const reputationInfo = getReputationTier(playerStats.reputation);
  const reputationProgress = (Math.max(0, playerStats.reputation) / 100) * 100;

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
                           <span>Outcast</span>
                           <span>Rookie</span>
                           <span>Syndicate</span>
                       </div>
                   </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
