typedef struct
{
  int nfft;        // size of FFT
  int numfreqs;    // number of frequencies represented (nfft/2 + 1)
  float* fft_data; // array for writing/reading to/from FFT function
} fft_vars;
