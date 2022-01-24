import * as throttle from 'lodash.throttle';
import {
  selectCurrentTime,
  selectDuration,
  selectIsPlaying,
  selectOldUrlTimePercent,
  selectUrls
} from 'selectors/audio_player';
import {AUDIO_TYPE, AudioUrlsMap} from 'reducers/page';

export enum PreloadType {
  None = 'none',
  Auto = 'auto',
  Metadata = 'metadata',
}

// dispatch when the html tag's callback tells us there's a new state
export const AUDIO_TAG_UPDATE = 'AUDIO_TAG_UPDATE';
export interface AudioTagUpdateAction {
  type: typeof AUDIO_TAG_UPDATE;
  playerId: string;
  data: AudioTagUpdateData;
}
export const audioTagUpdate = (playerId: string, data: AudioTagUpdateData): AudioTagUpdateAction => {
  return {
    type: AUDIO_TAG_UPDATE,
    playerId,
    data,
  }
};

interface AudioTagUpdateData {
  isPlaying?: boolean;
  currentTime?: number;
  oldUrlTimePercent?: number;
  duration?: number;
  volume?: number;
  isMuted?: boolean;
}

enum AudioListenerType {
  Started = 'playing',
  Paused = 'pause',
  Ended = 'ended',
  TimeUpdated = 'timeupdate',
  MetadataLoaded = 'loadedmetadata',
  VolumeChanged = 'volumechange',
}
const TIME_UPDATE_FREQUENCY_MS = 100;

interface AudioElement {
  playerId: string;
  syncedPlayerId?: string; // if provided, this other player is started and stopped at the same time
  allowParallelPlay: boolean;
  htmlTag: HTMLAudioElement;
  onMetadataLoaded: () => void;
  onAudioStarted: () => void;
  onAudioPaused: () => void;
  onAudioEnded: () => void;
  onTimeUpdated: () => void;
  onVolumeChanged: () => void;
}
const createAudioElement = (registerAction: RegisterAction,
                            loop: boolean,
                            allowParallelPlay: boolean,
                            syncedPlayerId: string|undefined,
                            getState: any,
                            dispatch: any): AudioElement => {
  const {
    playerId,
    activeUrlType,
    urls,
    preloadType,
    initialVolume,
  } = registerAction;

  const htmlTag = document.createElement('audio') as HTMLAudioElement;
  htmlTag.crossOrigin = 'anonymous';
  htmlTag.volume = initialVolume;
  htmlTag.preload = preloadType;
  htmlTag.loop = loop;
  /**
   * fix chrome bug (duration is 00:00) when playing urls created from recorded data
   * https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome
   */
  htmlTag.onloadedmetadata = function() {
    // it should already be available here
    if (htmlTag.duration === Infinity) {
      // set it to bigger than the actual duration
      htmlTag.currentTime = 1e101;
      htmlTag.ontimeupdate = function() {
        this.ontimeupdate = () => {
          return;
        };
        htmlTag.currentTime = 0;
      }
    }
  };
  htmlTag.src = urls[activeUrlType];
  const audioElement: AudioElement = {
    playerId,
    syncedPlayerId,
    htmlTag,
    allowParallelPlay,
    onMetadataLoaded: () => {
      const oldUrlTimePercent = selectOldUrlTimePercent(getState(), playerId);
      let currentTime = selectCurrentTime(getState(), playerId);
      if (oldUrlTimePercent !== undefined) {
        currentTime = htmlTag.duration * oldUrlTimePercent;
        htmlTag.currentTime = currentTime;
      }
      const updateData: AudioTagUpdateData = {
        duration: htmlTag.duration,
        currentTime,
        oldUrlTimePercent: undefined,
      };
      dispatch(audioTagUpdate(playerId, updateData));
    },
    onAudioStarted: () => {
      const updateData: AudioTagUpdateData = {
        isPlaying: true,
      };
      if (syncedPlayerId !== undefined) play(syncedPlayerId);
      dispatch(audioTagUpdate(playerId, updateData));
    },
    onAudioEnded: () => {
      const updateData: AudioTagUpdateData = {
        isPlaying: false,
      };
      if (syncedPlayerId !== undefined) pause(syncedPlayerId);
      dispatch(audioTagUpdate(playerId, updateData));
    },
    onAudioPaused: () => {
      const updateData: AudioTagUpdateData = {
        isPlaying: false,
      };
      if (syncedPlayerId !== undefined) pause(syncedPlayerId);
      dispatch(audioTagUpdate(playerId, updateData));
    },
    onVolumeChanged: () => {
      const updateData: AudioTagUpdateData = {
        volume: htmlTag.volume,
        isMuted: htmlTag.muted,
      };
      dispatch(audioTagUpdate(playerId, updateData));
    },
    onTimeUpdated: throttle(() => {
      if (selectOldUrlTimePercent(getState(), playerId) !== undefined) {
        // ignore time updates when we load a new url
        return;
      }
      const updateData: AudioTagUpdateData = {
        currentTime: htmlTag.currentTime,
      };
      dispatch(audioTagUpdate(playerId, updateData));
    }, TIME_UPDATE_FREQUENCY_MS),
  };
  htmlTag.addEventListener(AudioListenerType.MetadataLoaded, audioElement.onMetadataLoaded);
  htmlTag.addEventListener(AudioListenerType.Started, audioElement.onAudioStarted);
  htmlTag.addEventListener(AudioListenerType.Paused, audioElement.onAudioPaused);
  htmlTag.addEventListener(AudioListenerType.Ended, audioElement.onAudioEnded);
  htmlTag.addEventListener(AudioListenerType.TimeUpdated, audioElement.onTimeUpdated);
  htmlTag.addEventListener(AudioListenerType.VolumeChanged, audioElement.onVolumeChanged);

  return audioElement;
};
const destroyAudioElement = (audioElement: AudioElement): void => {
  const {
    htmlTag,
  } = audioElement;
  htmlTag.removeEventListener(AudioListenerType.MetadataLoaded, audioElement.onMetadataLoaded);
  htmlTag.removeEventListener(AudioListenerType.Started, audioElement.onAudioStarted);
  htmlTag.removeEventListener(AudioListenerType.Paused, audioElement.onAudioPaused);
  htmlTag.removeEventListener(AudioListenerType.Ended, audioElement.onAudioEnded);
  htmlTag.removeEventListener(AudioListenerType.TimeUpdated, audioElement.onTimeUpdated);
  htmlTag.removeEventListener(AudioListenerType.VolumeChanged, audioElement.onVolumeChanged);
  htmlTag.pause();
  htmlTag.src = '';
};

interface AudioElementsMap {
  [playerId: string]: AudioElement;
}
const AudioElements: AudioElementsMap = {};

export const AUDIO_PLAYER_PLAY = 'AUDIO_PLAYER_PLAY';
export interface PlayAction {
  type: typeof AUDIO_PLAYER_PLAY;
  playerId: string;
}
export const play = (playerId: string) => {
  const audioElement = AudioElements[playerId];
  if (audioElement === undefined) {
    return;
  }
  if (!audioElement.allowParallelPlay) {
    // when we start playing this audio element, stop all others that don't allow parallel play
    Object.values(AudioElements).forEach((audioElement) => {
      if (audioElement.playerId !== playerId && !audioElement.allowParallelPlay) {
        pause(audioElement.playerId);
      }
    });
  }
  audioElement.htmlTag.play();
};

export const AUDIO_PLAYER_PAUSE = 'AUDIO_PLAYER_PAUSE';
export interface PauseAction {
  type: typeof AUDIO_PLAYER_PAUSE;
  playerId: string;
}
export const pause = (playerId: string) => {
  const audioElement = AudioElements[playerId];
  if (audioElement === undefined) {
    return;
  }
  audioElement.htmlTag.pause();
};

export const AUDIO_PLAYER_REGISTER = 'AUDIO_PLAYER_REGISTER';
export interface RegisterAction {
  type: typeof AUDIO_PLAYER_REGISTER;
  playerId: string;
  urls: AudioUrlsMap;
  activeUrlType: AUDIO_TYPE;
  preloadType: PreloadType;
  initialVolume: number;
}
export const register = (playerId: string, urls: AudioUrlsMap,
                         activeUrlType: AUDIO_TYPE,
                         preloadType: PreloadType,
                         loop: boolean,
                         allowParallelPlay: boolean,
                         initialVolume: number,
                         syncedPlayerId: undefined|string = undefined) => {
  return (dispatch, getState) => {
    const action: RegisterAction = {
      type: AUDIO_PLAYER_REGISTER,
      activeUrlType,
      playerId,
      urls,
      preloadType,
      initialVolume,
    };
    const audioElement = createAudioElement(action, loop,
      allowParallelPlay,
      syncedPlayerId,
      getState,
      dispatch);
    AudioElements[playerId] = audioElement;
    dispatch(action);
  };
};

export const AUDIO_PLAYER_UNREGISTER = 'AUDIO_PLAYER_UNREGISTER';
export interface UnregisterAction {
  type: typeof AUDIO_PLAYER_UNREGISTER;
  playerId: string;
}
export const unregister = (playerId: string) => {
  return (dispatch, getState) => {
    const audioElement = AudioElements[playerId];
    if (audioElement === undefined) {
      return;
    }
    destroyAudioElement(audioElement);
    delete AudioElements[playerId];
    dispatch({
      type: AUDIO_PLAYER_UNREGISTER,
      playerId,
    });
  }
};

export const AUDIO_PLAYER_START_DRAG = 'AUDIO_PLAYER_START_DRAG';
export interface StartDragAction {
  type: typeof AUDIO_PLAYER_START_DRAG;
  playerId: string;
}
export const startDrag = (playerId: string) => {
  return (dispatch, getState) => {
    const audioElement = AudioElements[playerId];
    if (audioElement === undefined) {
      return;
    }
    pause(playerId);
    dispatch({
      type: AUDIO_PLAYER_START_DRAG,
      playerId,
    });
  }
};

export const toggleMute = (playerId: string, mute: boolean): void => {
  const audioElement = AudioElements[playerId];
  if (audioElement === undefined) {
    return;
  }
  audioElement.htmlTag.muted = mute;
};

export const setVolume = (playerId: string, volume: number): void => {
  const audioElement = AudioElements[playerId];
  if (audioElement === undefined) {
    return;
  }
  audioElement.htmlTag.volume = volume;
};

export const AUDIO_PLAYER_STOP_DRAG = 'AUDIO_PLAYER_STOP_DRAG';
export interface StopDragAction {
  type: typeof AUDIO_PLAYER_STOP_DRAG;
  playerId: string;
  currentTime: number;
}
export const stopDrag = (playerId: string, songPercent: number) => {
  return (dispatch, getState) => {
    const audioElement = AudioElements[playerId];
    if (audioElement === undefined) {
      return;
    }
    const duration = selectDuration(getState(), playerId) || 0;
    const newCurrentTime = duration * songPercent;
    audioElement.htmlTag.currentTime = newCurrentTime;
    play(playerId);
    dispatch({
      type: AUDIO_PLAYER_STOP_DRAG,
      playerId,
      currentTime: newCurrentTime,
    });
  }
};

export const AUDIO_PLAYER_SET_ACTIVE_URL_TYPE = 'AUDIO_PLAYER_SET_ACTIVE_URL_TYPE';
export interface SetActiveUrlTypeAction {
  type: typeof AUDIO_PLAYER_SET_ACTIVE_URL_TYPE;
  audioType: AUDIO_TYPE;
  playerId: string;
  oldUrlTimePercent: number;
}
export const setActiveUrlType = (playerId: string, audioType: AUDIO_TYPE) => {
  return (dispatch, getState) => {
    const state = getState();
    const urls = selectUrls(state, playerId);
    const audioElement = AudioElements[playerId];
    if (audioElement === undefined || urls === undefined) {
      return;
    }
    dispatch({
      type: AUDIO_PLAYER_SET_ACTIVE_URL_TYPE,
      audioType,
      playerId,
      oldUrlTimePercent: audioElement.htmlTag.currentTime / audioElement.htmlTag.duration,
    });
    // ensure the current time is saved before changing the url
    const currentTime = selectCurrentTime(state, playerId);
    dispatch(audioTagUpdate(playerId, {currentTime}));
    // check whether we are playing before changing the url
    const isPlaying = selectIsPlaying(state, playerId);
    // change the url
    audioElement.htmlTag.src = urls[audioType];
    // restore the playing state
    if (isPlaying) {
      play(playerId);
    }
  }
};

export type AudioPlayerActions = PlayAction |
  PauseAction |
  RegisterAction |
  UnregisterAction |
  AudioTagUpdateAction |
  StartDragAction |
  StopDragAction |
  SetActiveUrlTypeAction
