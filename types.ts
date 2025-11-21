
export enum GameState {
  INTRO = 'INTRO',
  TITLE_SCREEN = 'TITLE_SCREEN',
  LOGIN = 'LOGIN',
  MAIN_MENU = 'MAIN_MENU',
  MISSION_BRIEFING = 'MISSION_BRIEFING',
  DISPATCH_GAME = 'DISPATCH_GAME',
  STORYLINE = 'STORYLINE',
  LEADERBOARD = 'LEADERBOARD',
  ACCOUNT_SETTINGS = 'ACCOUNT_SETTINGS',
  CREDITS = 'CREDITS',
  LOADING = 'LOADING',
  MISSION_DEBRIEF = 'MISSION_DEBRIEF'
}

export interface MenuItem {
  label: string;
  action: () => void;
  id: string;
  description?: string;
}

export interface UserData {
    username: string;
    password?: string; 
    money: number;
    unlockedStories: number[];
    missionsCompleted: number;
    currentWinstreak: number;
    bestWinstreak: number;
    lastActive: string;
}
