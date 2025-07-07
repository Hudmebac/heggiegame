'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, Pirate, EncounterResult, CrewMember, PlayerStats } from '@/lib/types';
import { resolveEncounter, runPirateScan } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { SYSTEMS } from '@/lib/systems'; // Assuming SYSTEMS might be needed for security checks in resolveEncounter logic

const pirateNames = ['Dread Captain "Scar" Ironheart', 'Admiral "Voidgazer" Kael', 'Captain "Mad" Mel', 'Commander "Hex" Stryker'];
const shipTypes = ['Marauder-class Corvette', 'Reaper-class Frigate', 'Void-reaver Battleship', 'Shadow-class Interceptor'];
const threatLevels: Pirate['threatLevel'][] = ['Low', 'Medium', 'High', 'Critical'];

function generateRandomPirate(hasNavigator: boolean): Pirate {
    const weightedThreats: Pirate['threatLevel'][] = has