typedef struct {

  float* m_pfTune;
  float* m_pfFixed;
  float* m_pfPull;
  int* m_pfKey;
  float* m_pfAmount;
  float* m_pfSmooth;
  float* m_pfShift;
  int* m_pfScwarp;
  float* m_pfLfoamp;
  float* m_pfLforate;
  float* m_pfLfoshape;
  float* m_pfLfosymm;
  int* m_pfLfoquant;
  int* m_pfFcorr;
  float* m_pfFwarp;
  float* m_pfMix;

  float* m_pfInputBuffer1;
  float* m_pfOutputBuffer1;

  fft_vars* fmembvars; // member variables for fft routine

  unsigned long fs; // Sample rate

  unsigned long cbsize; // size of circular buffer
  unsigned long corrsize; // cbsize/2 + 1
  unsigned long cbiwr;
  unsigned long cbord;
  float* cbi; // circular input buffer
  float* cbf; // circular formant correction buffer
  float* cbo; // circular output buffer

  float* cbwindow; // hann of length N/2, zeros for the rest
  float* acwinv; // inverse of autocorrelation of window
  float* hannwindow; // length-N hann
  int noverlap;

  float* ffttime;
  float* fftfreqre;
  float* fftfreqim;

  // VARIABLES FOR LOW-RATE SECTION
  float aref; // A tuning reference (Hz)
  float inpitch; // Input pitch (semitones)
  float conf; // Confidence of pitch period estimate (between 0 and 1)
  float outpitch; // Output pitch (semitones)
  float vthresh; // Voiced speech threshold

  float pmax; // Maximum allowable pitch period (seconds)
  float pmin; // Minimum allowable pitch period (seconds)
  unsigned long nmax; // Maximum period index for pitch prd est
  unsigned long nmin; // Minimum period index for pitch prd est

  float lrshift; // Shift prescribed by low-rate section
  int ptarget; // Pitch target, between 0 and 11
  float sptarget; // Smoothed pitch target

  float lfophase;

  // VARIABLES FOR PITCH SHIFTER
  float phprdd; // default (unvoiced) phase period
  double inphinc; // input phase increment
  double outphinc; // input phase increment
  double phincfact; // factor determining output phase increment
  double phasein;
  double phaseout;
  float* frag; // windowed fragment of speech
  unsigned long fragsize; // size of fragment in samples

  // VARIABLES FOR FORMANT CORRECTOR
  int ford;
  float falph;
  float flamb;
  float* fk;
  float* fb;
  float* fc;
  float* frb;
  float* frc;
  float* fsig;
  float* fsmooth;
  float fhp;
  float flp;
  float flpa;
  float** fbuff;
  float* ftvec;
  float fmute;
  float fmutealph;

} Autotalent;
