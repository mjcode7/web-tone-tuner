import {Environment} from 'utils/Environment';

function inIframe () {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

const commonConfig = {
  siteName: 'Web Tone-Tuner',
  // shared
  recaptchaSiteKey: '',
};

interface StageConfig {
  stage: string;
  baseUrl: string;
  googleAnalyticsId?: string;
}

// for local network testing:
// const DEV_BASE_WEBPACK_URL = 'http://192.168.1.4:12444';
const DEV_BASE_WEBPACK_URL = 'http://localhost:12444';
export const DEV_BASE_S3_URL = `${DEV_BASE_WEBPACK_URL}/s3`;
const DEV_API_ENDPOINT = 'http://tune.local:3000';
const devConfig: StageConfig = {
  // sets up the app so the creation process is preloaded with content (useful for testing the submission steps)
  baseUrl: DEV_BASE_WEBPACK_URL,
  stage: 'dev',
};

export const BASE_URL_PROD = 'https://slothtoss.com';
const prodConfig: StageConfig = {
  baseUrl: BASE_URL_PROD,
  stage: 'prod',
  googleAnalyticsId: '',
};

const isProd = !Environment.isDev();
export const AppConfig = (isProd) ?
  {
    ...commonConfig,
    ...prodConfig,
  } :
  {
    ...commonConfig,
    ...devConfig,
  };
