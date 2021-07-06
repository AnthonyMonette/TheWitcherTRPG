rm -rf build && mkdir build && cp system.json ./build/system.json && zip -vr build/system.zip . -x '*.git*' -x '*build*' -x "build.sh" -x ".DS_Store"
