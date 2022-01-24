import {sanitizeStartTuner, sanitizeTunerFinished} from 'actions/tuner';
import {sanitizeTuner} from 'reducers/tuner';

const actionSanitizer = (action) => {
  const sanitizers = [
    sanitizeStartTuner,
    sanitizeTunerFinished,
  ];
  const applyFunction = (val, f) => f(val);
  return sanitizers.reduce(applyFunction, action);
};

const stateSanitizer = (state) => {
  const sanitizers = [
    sanitizeTuner,
  ];
  const applyFunction = (val, f) => f(val);
  return sanitizers.reduce(applyFunction, state);
};

export default {
  stateSanitizer,
  actionSanitizer,
}
