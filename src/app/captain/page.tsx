'use client';
import PlayerProfile from '@/app/components/player-profile';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Trophy } from 'lucide-react';

export default function CaptainPage() {
  const { gameState, handleGenerateAvatar, isGeneratingAvatar, handleGenerateBio, isGeneratingBio, setPlayerName } = useGame();

  if (!gameState) {
    return null; 
  }

  const { playerStats } = gameState;
  
  const leaderboardRank = gameState.leaderboard.find(e => e.trader === playerStats.name)?.rank || gameState.leaderboard.length;

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
      </div>
    </div>
  );
}
