/*
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux'
import * as style from './TunePage.less';
import AudioPlayer from 'components/generic/audio_player/AudioPlayer';
import {PreloadType} from 'actions/audio_player';
import createModule from 'wasm/out/tone_tuner.js';
import {WavConverter} from 'lib/audio/WavConverter';
import Recorder from 'components/create/song/Recorder';
import {selectCurrentRecordingId} from 'selectors/create/step';
import {FullCreatePageState} from 'redux_modules/create_page_state';
import {addRefrainAction} from 'actions/create';
import {Filter, RecordingEffect, RecordingType, selectWavUrl} from 'reducers/create/song/audio';
import PreviewRecording from 'components/create/song/record/PreviewRecording';
import {editRecordingEffect} from 'actions/create/song/audio';
import {LiveTuner} from 'lib/recording/LiveTuner';

export const mapStateToProps = (state: FullCreatePageState) => {
  const recordingId = selectCurrentRecordingId(state) as string;
  const recordingUrl = selectWavUrl(state, recordingId);
  return {
    recordingId,
    recordingUrl,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      addRefrainAction,
      editRecordingEffect,
    }, dispatch),
  };
};

interface ToneTuner {
  setSettings();
  processData(float32pointer: number, arrSize: number);
  delete();
  add(n1: number, n2: number);
  doubleArray(float32pointer: number, arrSize: number);
}

interface Module {
  ToneTuner: any;
  _malloc: (bytes: number) => number;
  HEAPF32: Float32Array;
  _free: (ptr: number) => void;
}

interface OwnState {
  wavUrl?: string;
  module?: Module;
}

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class TunePage extends React.Component<Props, OwnState> {
  private fileInput: any;

  public constructor(props: Props) {
    super(props);
    this.state = {
      wavUrl: undefined,
      module: undefined,
    };
    const {
      addRefrainAction,
    } = this.props;
    addRefrainAction();
  }

  public componentDidMount = () => {
    createModule().then((Module) => {
      console.log("Creating tone tuner...");
      this.setState({
        module: Module,
      });
      console.log("Created tone tuner.");
    });
  };

  private chooseFile = () => {
    console.log('choose the file');
    if (this.fileInput) {
      this.fileInput.click();
    }
  };

  private readFileData = async (blob: Blob) => {
    const ab = await blob.arrayBuffer();
    const ctx = new AudioContext();
    const decodedData: AudioBuffer = await ctx.decodeAudioData(ab);
    console.log('decoded array buffer data to', decodedData);
    const floatArrays: Float32Array[] = [];
    const NUM_FLOATS = decodedData.sampleRate;
    for (let i = 0; i < decodedData.numberOfChannels; i++) {
      // const ba: any = [];
      // for (let j = 0; j < NUM_FLOATS; j++) {
      //  ba.push(0.0);
      // }
      // floatArrays.push(new Float32Array(ba));
      floatArrays.push(decodedData.getChannelData(i));
    }
    const data = {
      floatArrays,
      numChannels: decodedData.numberOfChannels,
      sampleRate: decodedData.sampleRate,
      trimStartIndex: 0,
      trimEndIndex: floatArrays[0].length,
    };
    console.log("read file data:", data)
    return data;
  };

  private handleImageUrlChange = async (e) => {
    const blob = e.target.files[0];
    console.log('blob is ', blob);
    const {
      module,
    } = this.state;
    if (!module) return;

    const data = await this.readFileData(blob);
    const toneTuner = new module.ToneTuner(data.sampleRate);
    const inputJSArray: Float32Array = data.floatArrays[0];
    const buffer = module._malloc(inputJSArray.length * inputJSArray.BYTES_PER_ELEMENT);
     // The malloc function returns pointer to a memory address, but the typed array .set() function takes as the second parameter an index to the array that is being set. The index value refers to units of float32 (4 bytes in size) since HEAPF32 is a Float32Array, so the memory address needs to be divided by four. See the diagram on this page for an illustration: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
module.HEAPF32.set(inputJSArray, buffer >> 2);
toneTuner.setSettings();
toneTuner.processData(buffer, inputJSArray.length);

const outputJSArray = [];
for (let i=0; i<inputJSArray.length; i++) {
  const memoryLocation: number = buffer/Float32Array.BYTES_PER_ELEMENT+i;
  // @ts-ignore
  outputJSArray.push(module.HEAPF32[memoryLocation])
}

const wavConverter = new WavConverter();
wavConverter.convertFromFloatArrays([new Float32Array(outputJSArray)], data.sampleRate).then((wavUrl) => {
  this.setState({wavUrl});
});

// TODO, wrap in a try/finally to always free
module._free(buffer);
toneTuner.delete();
};

private renderPlayer = (wavUrl) => {
  if (wavUrl) {
    return (
      <AudioPlayer
        url={wavUrl}
        preloadType={PreloadType.Auto} />
    );
  }
};

private tuneRecording = (recordingId: string) => {
  this.props.editRecordingEffect(
    recordingId,
    RecordingEffect.Filter,
    Filter.AutoTune
  );
};

private renderRecording = () => {
  const {
    recordingId,
    recordingUrl,
  } = this.props;
  if (!recordingId) return null;

  return (
    <div>
      { <Recorder recordingId={recordingId} />}
      { recordingUrl && <PreviewRecording recordingId={recordingId} recordingType={RecordingType.Refrain} />}
      { recordingUrl && <a onClick={() => this.tuneRecording(recordingId)}><span>Tune recording</span></a>}
    </div>
  );
};

private startLiveTuning = () => {
  const liveTuner = new LiveTuner();
  liveTuner.start();
};

public render = () => {
  const {
    wavUrl,
    module,
  } = this.state;
  if (!module) {
    return null;
  }
  return (
    <div>
      <a onClick={this.chooseFile}><span>Choose file</span></a>
      <input ref={el => this.fileInput = el} className={style.hiddenInput} type="file" onChange={this.handleImageUrlChange} />
      {this.renderPlayer(wavUrl)}
      {this.renderRecording()}
      <a onClick={this.startLiveTuning}><span>Start live tuning</span></a>
    </div>
  );
}
}

export default connect(mapStateToProps, mapDispatchToProps)(TunePage);
*/
