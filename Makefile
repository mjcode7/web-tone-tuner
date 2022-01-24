SRC_DIR=src/wasm
OUT_DIR=src/wasm/out

tone_tuner: ${SRC_DIR}/*.cpp ${SRC_DIR}/*.c
	emcc -Wall --no-entry \
	   --pre-js ${SRC_DIR}/override_print.js \
	   --bind \
	   ${SRC_DIR}/autotalent.c \
	   ${SRC_DIR}/mayer_fft.c \
	   ${SRC_DIR}/tone_tuner.cpp -o ${OUT_DIR}/tone_tuner.mjs  \
	  -s ENVIRONMENT='web'  \
	  -s SINGLE_FILE=1  \
	  -s EXPORT_NAME='createModule'  \
	  -s USE_ES6_IMPORT_META=0  \
	  -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]'  \
	  -s ALLOW_MEMORY_GROWTH=1 \
	  -O3
	mv ${OUT_DIR}/tone_tuner.mjs ${OUT_DIR}/tone_tuner.js

clean:
	rm -f ${OUT_DIR}/*.a
	rm -f ${OUT_DIR}/*.o
	rm -f ${OUT_DIR}/*.js
