window.onload = () => {

  // Instantiate audio context that is needed to define AudioObject class.
  let audioCtx = new AudioContext();

  class AudioObject {
    constructor(filePath) {
      // "Hack" to build asynchronous constructor. See the second answer here:
      //    https://stackoverflow.com/questions/43431550/async-await-class-constructor

      return (async () => {
        // Build DSP elements of audio object.
        this.gain = audioCtx.createGain();
        this.source = await this.#createSource(filePath);
        this.panner = audioCtx.createStereoPanner();
        this.reverb = await this.#createReverb();
        this.filter = this.#createHighShelf();

        // Connect the elements.
        this.source.connect(this.reverb);
        this.reverb.connect(this.filter);
        this.filter.connect(this.panner);
        this.panner.connect(this.gain);
        this.gain.connect(audioCtx.destination);

        return this;
      })()
    }

    // Interface.
    play() {
      this.source.start();
    };

    stop() {
      this.source.stop();
    };

    pan(val) {
      this.panner.pan.setValueAtTime(val, audioCtx.currentTime);
    }

    setDepth(val) {
      const MAX_FILT_GAIN_DB = 36;

      let tmpA = Math.min(val, 0) * MAX_FILT_GAIN_DB;
      this.filter.gain.setValueAtTime(tmpA, audioCtx.currentTime);

      let tmpB = 1 - Math.max(val, 0);
      this.gain.gain.setValueAtTime(tmpB, audioCtx.currentTime);
    }

    // "Private" methods.
    async #createSource(filePath) {
      let response = await fetch(filePath);
      let audioData = await response.arrayBuffer();
      let audioBuffer = await audioCtx.decodeAudioData(audioData);
      let audioSource = audioCtx.createBufferSource();

      audioSource.buffer = audioBuffer;
      audioSource.loop = true;

      return audioSource;
    };

    async #createReverb() {
      const VERB_IR_PATH = "../audio/St Nicolaes Church_WET.wav";

      let convolver = audioCtx.createConvolver();
      let response = await fetch(VERB_IR_PATH);
      let audioData = await response.arrayBuffer();

      convolver.buffer = await audioCtx.decodeAudioData(audioData);
      return convolver;
    };

    #createHighShelf() {
      const F0_HZ = 1200;
      const DEFAULT_Q = 0.707;

      let filter = audioCtx.createBiquadFilter();

      filter.type = "highshelf";
      filter.frequency.setValueAtTime(F0_HZ, audioCtx.currentTime);
      filter.Q.setValueAtTime(DEFAULT_Q, audioCtx.currentTime);
      filter.gain.setValueAtTime(-36, audioCtx.currentTime);

      return filter;
    }
  }

  // Build simple website.
  // const startAudioButton = document.createElement('button');
  // startAudioButton.innerText = "Play";
  // startAudioButton.addEventListener("click", () => { startAudio() });
  // document.body.appendChild(startAudioButton);

  // const stopAudioButton = document.createElement('button');
  // stopAudioButton.innerText = "Stop";
  // stopAudioButton.addEventListener("click", () => { stopAudio() });
  // document.body.appendChild(stopAudioButton);

  if (pageLoaded) {
    startAudio();
  } else {
    document.addEventListener('DOMContentLoaded', startAudio);
  }

  let audioObjectList = [];
  async function startAudio() {
    // Filepaths to playback sounds, hardcoded for now.
    const FILE_PATHS = ['../audio/demonstrative.mp3', '../audio/solemn.mp3'];

    for (const path of FILE_PATHS) {
      let tmp = await new AudioObject(path);
      tmp.play();
      audioObjectList.push(tmp);
    }
  }

  // function stopAudio() {
  //   for (const audioObject of audioObjectList)
  //     audioObject.stop();
  // }

  document.onmousemove = (e) => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    var str_xy = "x: "+ x+", y: "+ y;
    document.getElementById("demo1").innerHTML = str_xy;

    var str_wh = "width: "+ width+", height: "+ height;
    document.getElementById("demo2").innerHTML = str_wh;

    // Calculate normalized position from center of window.
    // let normX = (x / width - 0.5) * 2;
    // let normY = (y / height - 0.5) * 2;

    // Calculate normalized position from the button position
    var button_width = 200/2; // Button's width is 200, but we want the center of it, so 100
    var button_height = 90/2; // Button's height is 90, but we want the center of it, so 45
    var page_padding = 45;    // 45px is the page's bottom padding
    var posX = 0;
    var posY = 0;

    if (button_top > 0) {
      var posY = (button_top+button_height) / height;
    }
    if (button_right > 0) {
      var posX = (width-button_right-button_width) / width;
    }
    if (button_bottom > 0) {
      var posY = (height-button_bottom-button_height-page_padding) / height;
    }
    if (button_left > 0) {
      var posX = (button_left+button_width) / width;
    }

    let normX = (x / width - posX) * 2;
    let normY = (y / height - posY) * 2;

    var str_normxy = "normX: "+ normX+", normY: "+ normY;
    document.getElementById("demo3").innerHTML = str_normxy;

    let magnitude = Math.sqrt(Math.pow(normX, 2) + Math.pow(normY, 2));

    for (let audioObject of audioObjectList) {
      audioObject.pan(-normX);
      audioObject.setDepth(normY);
    }

  };

}