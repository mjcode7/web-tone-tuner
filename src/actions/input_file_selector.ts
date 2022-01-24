import {startTuner} from 'actions/tuner';
import {changePage} from 'actions/page';
import {InputAudioType, PageId} from 'reducers/page';
import {selectTunerSettings} from 'selectors/tuner';
import {FileUtils} from 'utils/FileUtils';
import {analytics, EventAction} from 'lib/Analytics';

const readFileToAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
  const ab = await blob.arrayBuffer();
  const ctx = new AudioContext();
  return await ctx.decodeAudioData(ab);
};

export function selectedNewFile(blob: Blob) {
  return async (dispatch, getState) => {
    analytics.logEvent(EventAction.SelectedNewFile);
    console.log("File was selected. Blob is:", blob);
    dispatch(changePage(PageId.TuningProgress));
    const audioBuffer = await readFileToAudioBuffer(blob);
    console.log("Audio context decoded blob's array buffer to audio buffer:", audioBuffer);
    const tunerSettings = selectTunerSettings(getState());
    const audioUrl = URL.createObjectURL(blob);
    const inputFilename = blob.name; // e.g. 'myfile.mp3'
    const inputBasename = FileUtils.removeExtension(inputFilename); // e.g. 'myfile'
    await dispatch(startTuner(InputAudioType.File, inputBasename, audioBuffer, audioUrl, tunerSettings, PageId.PlayTunedFileAudio));
  };
}

