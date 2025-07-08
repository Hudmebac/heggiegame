
export const casinoNarratives: Record<string, { win: string[]; loss: string[]; bonus: string[] }> = {
  slots: {
    win: [
      "The reels click into place... 7-7-7! A cascade of credits pours from the machine as the alarms blare your victory.",
      "A perfect alignment! The lights flash and the machine sings a triumphant tune as your winnings are dispensed.",
      "Jackpot! The machine groans under the weight of the payout, drawing a crowd of envious onlookers.",
      "The symbols line up perfectly. A simple pull of the lever turns into a significant payday.",
    ],
    loss: [
      "A near miss! The reels stop just one symbol short of a massive payout. Better luck next time.",
      "The machine buzzes disappointingly. Your credits are gone, but the thrill remains.",
      "Clank. The reels settle into a meaningless jumble of symbols. The house takes your stake.",
      "So close! The final reel spins, and spins... and lands on a dud. The machine silently accepts your donation.",
    ],
    bonus: [
      "As you cash out, a flashing light indicates you've won the 'Galactic Progressive Jackpot'!",
      "A special bonus round triggers! After a whirlwind of lights and sounds, you walk away with a hefty extra prize.",
    ],
  },
  table: {
    win: [
      "The dice are hot! You make your point and rake in a mountain of chips from the center of the table.",
      "Blackjack! The dealer busts, and you sweep the table with a confident grin.",
      "The roulette ball bounces, skips, and finally settles on your number. The croupier pushes a stack of chips your way.",
      "A winning streak! You can't seem to lose, and your stack of credits grows with every play.",
    ],
    loss: [
      "Crapped out. The dice betray you, and the stickman clears your bet with practiced efficiency.",
      "The dealer flips a 21, beating your hand by a single point. A tough break.",
      "The roulette wheel spins, and your number flies by without a second glance. The house claims your bet.",
      "A calculated risk doesn't pay off. Your chips are swept away by the croupier's rake.",
    ],
    bonus: [
      "The pit boss, impressed by your play, comps you a massive stack of high-value chips.",
      "You hit a rare side bet, multiplying your winnings tenfold in a stunning display of luck.",
    ],
  },
  poker: {
    win: [
      "You lay down a royal flush, and a stunned silence falls over the table. The pot is yours.",
      "A well-timed bluff forces everyone to fold. You drag in the massive pot without even showing your cards.",
      "Your full house beats their flush. A satisfying victory built on patience and a good read.",
      "They took the bait. Your trap springs perfectly, and their entire stack is now part of yours.",
    ],
    loss: [
      "You call their all-in, only to see them reveal the one hand that beats you. A costly miscalculation.",
      "Your bluff is called. You're forced to reveal your weak hand, and the pot slides to your opponent.",
      "A bad beat. The river card gives your opponent a miracle win, and your chips are gone.",
      "Outplayed and out-witted. They saw through your strategy and took you for a ride.",
    ],
    bonus: [
      "You win the high-hand jackpot for the hour, adding a significant bonus to your winnings.",
      "Your impressive play catches the eye of a mysterious benefactor who offers you a private, high-stakes game.",
    ],
  },
  vip: {
    win: [
      "In the silent, high-stakes room, you make the call that breaks the bank. The other players can only nod in respect.",
      "A masterful play secures a pot larger than most people see in a lifetime. The VIP host quietly replenishes your drink.",
      "Your intuition pays off. You go all-in on a long shot and are rewarded with a legendary win.",
      "The tension breaks as you reveal the winning hand. A quiet, professional payout follows.",
    ],
    loss: [
      "A moment's hesitation costs you dearly. In the VIP room, even small mistakes are brutally punished.",
      "Your opponent, a silent figure with mirrored glasses, reads you perfectly and cleans you out.",
      "A high-stakes gamble fails to materialize, and your massive buy-in vanishes in an instant.",
      "You're outmatched. A quiet nod from the dealer signals your exit from the table.",
    ],
    bonus: [
      "As you cash out, the casino manager approaches. 'The house is so impressed, we'd like to offer you a... token of our appreciation.'",
      "You've qualified for the 'Tournament of Champions'! Your winnings just became the entry fee for something much bigger.",
    ],
  },
  sportsbook: {
    win: [
      "The underdog team pulls off a last-minute victory! Your risky bet pays off handsomely.",
      "Just as predicted, the favored team dominates the match. A safe bet, but a profitable one.",
      "A stunning upset! Your long-shot bet on the Grav-Ball championship makes you the talk of the sportsbook.",
      "The final score is exactly as you predicted. Your prop bet yields a massive return.",
    ],
    loss: [
      "A controversial call reverses the outcome, and your winning ticket is suddenly worthless.",
      "The star player suffers an injury, and your team's performance collapses. A stroke of bad luck.",
      "The match ends in a draw, voiding your bet. A frustrating but not-uncommon outcome.",
      "Your analysis was flawless, but the chaos of the game had other plans. Your bet is lost.",
    ],
    bonus: [
      "You hit a multi-game parlay, turning a small bet into a life-changing sum of credits.",
      "Your winning streak earns you an invitation to the owner's box for the next championship game.",
    ],
  },
  lottery: {
    win: [
      "The winning numbers are announced... and they match your ticket! You've hit the galactic lottery!",
      "A one-in-a-billion chance! Your lottery ticket is the grand prize winner. Your life will never be the same.",
    ],
    loss: [
      "You check your lottery ticket against the winning numbers. Not even close. There's always tomorrow.",
      "The grand prize winner is announced from a distant system. Your ticket is now a souvenir.",
    ],
    bonus: [
      "You didn't win the grand prize, but you matched the bonus number for a significant secondary prize!",
      "Your lottery ticket purchase enters you into a 'second chance' drawing, which you win!",
    ],
  },
};
