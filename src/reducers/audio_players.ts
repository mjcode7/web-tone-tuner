import {EMPTY_MAP} from 'lib/constants';
import {
  AUDIO_PLAYER_REGISTER,
  AUDIO_PLAYER_SET_ACTIVE_URL_TYPE,
  AUDIO_PLAYER_START_DRAG,
  AUDIO_PLAYER_STOP_DRAG,
  AUDIO_PLAYER_UNREGISTER,
  AUDIO_TAG_UPDATE,
  AudioPlayerActions,
} from 'actions/audio_player';
import {AUDIO_TYPE, AudioUrlsMap} from 'reducers/page';
import {selectOldUrlTimePercent} from 'selectors/audio_player';

export interface AudioPlayer {
  activeUrlType: AUDIO_TYPE;
  urls: AudioUrlsMap;
  playerId: string;
  isPlaying: boolean;
  currentTime: number;
  duration?: number;
  oldUrlTimePercent?: number;
  isDragging: boolean;
  volume: number;
  isMuted: boolean;
}

export interface AudioPlayersState {
  [playerId: string]: AudioPlayer;
}

const INITIAL_STATE: AudioPlayersState = EMPTY_MAP;

type ActionTypes = AudioPlayerActions;

const updatePlayer = (state: AudioPlayersState, playerId: string, newPlayerData: Partial<AudioPlayer>): AudioPlayersState => {
  const existingPlayerData: AudioPlayer|undefined = state[playerId];
  if (existingPlayerData === undefined) return state;
  return {
    ...state,
    [playerId]: {
      ...existingPlayerData,
      ...newPlayerData,
    },
  };
};

export default function(state: AudioPlayersState = INITIAL_STATE, action: ActionTypes): AudioPlayersState {
  switch(action.type) {
    case AUDIO_PLAYER_SET_ACTIVE_URL_TYPE: {
      const {
        audioType,
        playerId,
        oldUrlTimePercent,
      } = action;
      return updatePlayer(state, playerId, {
        activeUrlType: audioType,
        oldUrlTimePercent,
      });
    }
    case AUDIO_PLAYER_REGISTER: {
      const {
        playerId,
        urls,
        initialVolume,
        activeUrlType,
      } = action;
      return {
        ...state,
        [playerId]: {
          activeUrlType,
          playerId,
          urls,
          isPlaying: false,
          currentTime: 0,
          oldUrlTimePercent: undefined,
          isDragging: false,
          volume: initialVolume,
          isMuted: false,
        },
      };
    }
    case AUDIO_PLAYER_UNREGISTER: {
      const {
        playerId,
      } = action;
      const newState = {...state};
      delete newState[playerId];
      return newState;
    }
    case AUDIO_TAG_UPDATE: {
      const {
        playerId,
        data,
      } = action;
      return updatePlayer(state, playerId, data);
    }
    case AUDIO_PLAYER_START_DRAG: {
      const {
        playerId,
      } = action;
      return updatePlayer(state, playerId, {
        isDragging: true,
      });
    }
    case AUDIO_PLAYER_STOP_DRAG: {
      const {
        playerId,
        currentTime,
      } = action;
      return updatePlayer(state, playerId, {
        isDragging: false,
        currentTime,
      });
    }
		default:
			return state;
  }
}
