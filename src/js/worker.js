var remainingAudioBuffer = 0;

addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
        case 'set':
            settings[data.key] = data.value;
            break;
        case 'init_sound':
            gameboy.initSound();
            break;
        case 'stop_sound':
            if (gameboy) {
                gameboy.stopSound();
            }
            break;
        case 'start':
            postMessage({'cmd': 'log', 'message': 'start received!'});
            start(data.identifier, undefined, data.data);
            break;
        case 'auto_save':
            autoSave();
            break;
        case 'clear_last_emulation':
            clearLastEmulation();
            break;
        case 'key_down':
            GameBoyKeyDown(data.key);
            break;
        case 'key_up':
            GameBoyKeyUp(data.key);
            break;
        case 'pause':
            pause();
            break;
        case 'run':
            run();
            break;
        case 'remaining_audio_buffer':
            remainingAudioBuffer = data.length;
            break;
    }
}, false);

function cout(message, level) {
    postMessage({'cmd': 'log', 'message': message});
}

function arrayToBase64(u8Arr) {
  return utilities.arrayToBase64(u8Arr);
}

function base64ToArray(b64encoded) {
  return utilities.base64ToArray(b64encoded);
}
