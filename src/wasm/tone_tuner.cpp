#include <string>
#include <emscripten/emscripten.h>
#include "fft_vars.h"
#include "Autotalent.h"
#include <emscripten/bind.h>

using namespace emscripten;

// #define BUFFER_SIZE 10000
// #define SAMPLE_RATE 44100

//declare the functions in autotalent.c that we need to call externally
extern "C" {
    //pass sample rate to get the Autotalent instance
    Autotalent * instantiateAutotalent(unsigned long sampleRate);

    //pass the instance, and a whole bunch of params to setup
    void autotalentInitialize(Autotalent * instance,
        float concertA,
        char * key,
        float fixedPitch,
        float fixedPull,
        float correctStrength,
        float correctSmooth,
        float pitchShift,
        int scaleRotate,
        float lfoDepth,
        float lfoRate,
        float lfoShape,
        float lfoSym,
        int lfoQuant,
        int formCorr, float formWarp, float mix
    );

    void autotalentProcess(Autotalent * instance,float* sampleBuffer,int sampleSize);
    void autotalentDestroy(Autotalent * instance);
}

class ToneTuner{
    public:
        ToneTuner(int sampleRate) {
            printf("constructor start\n");
            instance = instantiateAutotalent(sampleRate);
            // buffer = (float*)malloc(BUFFER_SIZE*sizeof(float));
            printf("constructor end\n");
        }

        void setSettings() {
            printf("start setSettings\n");
            autotalentInitialize(instance,
                440,
                "C",
                2.0,
                0.1,
                1.0,
                0.0,
                1.0,
                0,
                0.1,
                1.0,
                0.0,
                0.0,
                1,
                0,
                0.0,
                1.0
            );
            printf("end setSettings\n");
        }

        void processData(uintptr_t floatPtrInput, int arrSize) {
            // https://stackoverflow.com/a/27364643
            float* ptr = reinterpret_cast<float*>(floatPtrInput);
            autotalentProcess(instance, ptr, arrSize);
        }

        ~ToneTuner() {
            printf("destructor start\n");
            autotalentDestroy(instance);
            // free(buffer);
            // *buffer = 0;
            instance = NULL;
            printf("destructor end\n");
        }

    private:
        Autotalent * instance;
        // float * buffer;
};

EMSCRIPTEN_BINDINGS(tone_tuner_module) {
    class_<ToneTuner>("ToneTuner")
        .constructor<int>()
        .function("setSettings", &ToneTuner::setSettings)
        .function("processData", &ToneTuner::processData)
        ;
}
