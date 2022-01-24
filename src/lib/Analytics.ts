import ReactGA from 'react-ga';
import {AppConfig} from 'app_config';
import {Environment} from 'utils/Environment';
import {ErrorInfo} from 'react';
import {Time} from 'utils/Time';

export enum EventAction {
  SelectedNewFile = 'SELECTED_NEW_FILE',
  ClickDownloadFile = 'CLICK_DOWNLOAD_FILE',
}

export enum TimeVariable {
  // the time it took to tune the user's input
  TunedInput = 'TUNED_INPUT',
  // the time it took to convert the tuned float arrays to wav url
  ConvertTunedOutputToWAV = 'CONVERT_TUNED_OUTPUT_TO_WAV',
}

export const logTime = async (variable: TimeVariable, asyncFn: () => Promise<any>) => {
  const startTime = Time.currentTsMs();
  const returnValue = await asyncFn();
  const endTime = Time.currentTsMs();
  analytics.logTime(variable, endTime-startTime);
  return returnValue;
};

const CATEGORY = 'WEB_TONE_TUNER';

class Analytics {
  private isEnabled: boolean;
  public constructor(isEnabled: boolean) {
    this.isEnabled = isEnabled;
    const analyticsId = AppConfig.googleAnalyticsId;
    if (isEnabled && analyticsId !== undefined) {
      ReactGA.initialize(analyticsId);
    }
  }

  public logTime(variable: TimeVariable, timeMillis: number): void {
    const event = {
      category: CATEGORY,
      variable,
      value: timeMillis,
    };
    console.log('[Analytics logging] time event (value is in millis):', event);
    if (this.isEnabled) {
      ReactGA.timing(event);
    }
  }

  public logPageView(): void {
    const page = window.location.pathname + window.location.search;
    console.log('[Analytics logging] page view:', page);
    if (this.isEnabled) {
      ReactGA.set({ page });
      ReactGA.pageview(page);
    }
  }

  public logModalView(name: string): void {
    const pathName = `${window.location.pathname}/${name}`;
    console.log('[Analytics logging] modal view:', pathName);
    if (this.isEnabled) {
      ReactGA.modalview(pathName);
    }
  }

  public logEvent(action: EventAction): void {
    const event = {
      category: CATEGORY,
      action,
    };
    console.log('[Analytics logging] event:', event);
    if (this.isEnabled) {
      // @ts-ignore
      ReactGA.event(event);
    }
  }

  public logError(error?: Error, errorInfo: ErrorInfo|undefined = undefined): void {
    console.log('[Analytics logging] Error=', error, 'errorInfo=', errorInfo);
    if (this.isEnabled) {
      /*
      TODO, post a custom lambda
      const message = {
        error: {
          message: error.message,
          stack: error.stack,
        },
        path: window.location.pathname,
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        ...errorInfo,
      };
       */
      if (!error) {
        console.error('Attempted to log an incomplete error', error, errorInfo);
        return;
      }
      ReactGA.exception({
        description: error.message,
        fatal: true,
      });
    }
  }
}

const isGoogleAnalyticsEnabled = !Environment.isDev();
export const analytics = new Analytics(isGoogleAnalyticsEnabled);
