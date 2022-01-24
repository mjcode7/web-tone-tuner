import {CoreState} from 'redux_modules/core_state';
import {AudioPlayer, AudioPlayersState} from 'reducers/audio_players';
import {AUDIO_TYPE, AudioUrlsMap} from 'reducers/page';

const selectAudioPlayer = (state: CoreState, playerId: string): AudioPlayer|undefined => {
  return state.audioPlayers[playerId];
};

export const selectIsPlaying = (state: CoreState, playerId: string): boolean => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return false;
  return player.isPlaying;
};

export const selectCurrentTime = (state: CoreState, playerId: string): number => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return 0;
  return player.currentTime;
};

export const selectDuration = (state: CoreState, playerId: string): number|undefined => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return undefined;
  return player.duration;
};

export const selectIsDragging = (state: CoreState, playerId: string): boolean => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return false;
  return player.isDragging;
};

export const selectIsMuted = (state: CoreState, playerId: string): boolean => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return false;
  return player.isMuted;
};

export const selectVolume = (state: CoreState, playerId: string): number => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return 1;
  return player.volume;
};

export const selectActiveUrlType = (state: CoreState, playerId: string): AUDIO_TYPE => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return AUDIO_TYPE.TUNED;
  return player.activeUrlType;
};

export const selectUrls = (state: CoreState, playerId: string): AudioUrlsMap|undefined => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return undefined;
  return player.urls;
};

export const selectOldUrlTimePercent = (state: CoreState, playerId: string): number|undefined => {
  const player = selectAudioPlayer(state, playerId);
  if (player === undefined) return undefined;
  return player.oldUrlTimePercent;
};

export interface AudioPlayersRootState {
  audioPlayers: AudioPlayersState;
}

// so we can use the selectors from the reducer (which only operates on a slice of the state)
export const toAudioPlayersRootState = (audioPlayersState: AudioPlayersState): AudioPlayersRootState => {
  return {
    audioPlayers: audioPlayersState,
  };
};
