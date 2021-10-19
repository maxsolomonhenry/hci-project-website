window.onload = () => {

    let audioCtx = new AudioContext();

    async function createReverb() {
        let convolver = audioCtx.createConvolver();

        let response = await fetch("./audio/St Nicolaes Church.wav");
        let audioData = await response.arrayBuffer();
        convolver.buffer = await audioCtx.decodeAudioData(audioData);

        return convolver;
    }

    const FILE_PATH = './audio/demonstrative.mp3';

    const startEngineButton = document.createElement('button');
    startEngineButton.innerText = "Start";
    startEngineButton.addEventListener("click", () => {startEngine()});

    async function startEngine() {
        const response = await fetch(FILE_PATH);
        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(audioData);
        const audioSource = audioCtx.createBufferSource();

        audioSource.buffer = audioBuffer;

        let panNode = audioCtx.createStereoPanner();
        let reverb = await createReverb();
        let filter = audioCtx.createBiquadFilter();

        filter.type = "highshelf";
        filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
        filter.Q.setValueAtTime(0.707, audioCtx.currentTime);
        filter.gain.setValueAtTime(-36, audioCtx.currentTime);

        audioSource.connect(filter);
        filter.connect(reverb);
        reverb.connect(panNode);
        panNode.connect(audioCtx.destination);

        panNode.pan.setValueAtTime(0, audioCtx.currentTime);
        
        audioSource.loop = true;
        audioSource.start();
    }

    document.body.appendChild(startEngineButton);

}