window.onload = () => {

  let audioCtx = new AudioContext();

  class AudioObject {
    constructor(filePath) {
      // "Hack" to build asynchronous constructor. See second answer:
      //    https://stackoverflow.com/questions/43431550/async-await-class-constructor

      return (async () => {
        // Build DSP elements of audio object.
        this.source = await this.#createSource(filePath);
        this.panner = audioCtx.createStereoPanner();
        this.reverb = await this.#createReverb();
        this.filter = this.#createHighShelf();
  
        // Connect the elements.
        this.source.connect(this.filter);
        this.filter.connect(this.reverb);
        this.reverb.connect(this.panner);
        this.panner.connect(audioCtx.destination);

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
      const VERB_IR_PATH = "./audio/St Nicolaes Church.wav";
  
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

  const startAudioButton = document.createElement('button');
  startAudioButton.innerText = "Play";
  startAudioButton.addEventListener("click", () => { startAudio() });
  document.body.appendChild(startAudioButton);

  const stopAudioButton = document.createElement('button');
  stopAudioButton.innerText = "Stop";
  stopAudioButton.addEventListener("click", () => { stopAudio() });
  document.body.appendChild(stopAudioButton);

  let myAudio;

  async function startAudio() {
    // Audio objects have to be rebuilt after being stopped.
    const FILE_PATH = './audio/demonstrative.mp3';
    myAudio = await new AudioObject(FILE_PATH);
    myAudio.play();
  }

  function stopAudio() {
    myAudio.stop();
  }

}