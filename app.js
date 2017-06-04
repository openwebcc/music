/*
 * 
 * Los' amoi! Javascript library
 * 
 */

/* eslint-env browser */

window.addEventListener('load', function () {
    var audio, nodes, values, output, player;
    audio = document.querySelector('audio');
    nodes = {
        selectAudioFile : document.querySelector('#audiofile'),
        beatsMinus : document.querySelector('#beatsMinus'),
        beatsPlus : document.querySelector('#beatsPlus'),
    };
    values = {
        lastBeatTime : null
    };
    output = {
        volume : document.querySelector('#volume'),
        playbackrate : document.querySelector('#playbackrate'),
        beat : document.querySelector('#beat'),
        beatsBack : document.querySelector('#beatsBack'),
        loopFrom : document.querySelector("#loopFrom"),
        loopTo : document.querySelector("#loopTo"),
    };
    player = {
        play : function () {
            audio.play();
        },
        pause : function () {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        },
        stop : function () {
            audio.pause();
            audio.currentTime = 0;
        },
        back : function () {
            if (output.beat.value) {
                audio.currentTime -= output.beat.value * output.beatsBack.value;
            } else {
                audio.currentTime -= 5.0;
            }
        },
        forward : function () {
            if (output.beat.value) {
                audio.currentTime += output.beat.value * output.beatsBack.value;
            } else {
                audio.currentTime += 5.0;
            }
        },
        loader : function () {
            audio.volume += (audio.volume <= (1.0 - 0.05) ? 0.05 : 0.0);
            output.volume.value = audio.volume.toFixed(2);
        },
        leiser : function () {
            audio.volume += (audio.volume >= (0.0 + 0.05) ? -0.05 : 0.0);
            output.volume.value = audio.volume.toFixed(2);
        },
        faster : function () {
            audio.playbackRate += (audio.playbackRate >= (0.0 + 0.05) ? 0.05 : 0.0);
            output.playbackrate.value = audio.playbackRate.toFixed(2);
        },
        slower : function () {
            audio.playbackRate += (audio.playbackRate >= (0.0 + 0.05) ? -0.05 : 0.0);
            output.playbackrate.value = audio.playbackRate.toFixed(2);
        },
        resetSpeed : function () {
            audio.playbackRate = audio.defaultPlaybackRate;
            output.playbackrate.value = audio.playbackRate.toFixed(2);
        },
        setBeat : function () {
            if (! values.lastBeatTime) {
                values.lastBeatTime = audio.currentTime;
            } else {
                output.beat.value = (audio.currentTime - values.lastBeatTime).toFixed(2);
                values.lastBeatTime = audio.currentTime;
                nodes.beatsMinus.parentNode.style.display = "block";
            }
        },
        clearBeat : function () {
            values.lastBeatTime = null;
            output.beat.value = "";
            nodes.beatsMinus.parentNode.style.display = "none";
        },
        setLoop : function () {
            if (! output.loopFrom.value) {
                // set start of loop
                output.loopFrom.value = audio.currentTime;
            } else if (! output.loopTo.value) {
                // set end of loop
                output.loopTo.value = audio.currentTime;
            } else {
                // start new loop
                output.loopFrom.value = audio.currentTime;
                output.loopTo.value = "";
            }
        },
        clearLoop : function () {
            output.loopFrom.value = "";
            output.loopTo.value = "";
        },
    };

    // load the file
   nodes.selectAudioFile.onchange = function(evt) {
        audio.src = window.URL.createObjectURL(evt.target.files[0]);
    };

    // set number of beats to go back / forward with arrows once beat is set
    nodes.beatsMinus.onclick = function () {
        output.beatsBack.value = parseInt(output.beatsBack.value) - 1;
        if (output.beatsBack.value < 1) {
            output.beatsBack.value = "1";
        }
    };
    nodes.beatsPlus.onclick = function () {
        output.beatsBack.value = parseInt(output.beatsBack.value) + 1;
    };

    // loop between to timestamps if they are set
    audio.ontimeupdate = function () {
        if (output.loopFrom.value && output.loopTo.value) {
            if (audio.currentTime > output.loopTo.value) {
                audio.currentTime = output.loopFrom.value;
            }
        }
    };

    // implement (some) winamp shortcuts, see https://shortcutworld.com/en/Winamp/win/all
    document.onkeydown = function (evt) {
        if (evt.keyCode === 88) {
            // x -> play
            player.play();
        } else if (evt.keyCode === 67) {
            // c -> pause / unpause
            player.pause();
        } else if (evt.keyCode === 86) {
            // v -> stop
            player.stop();
        } else if (evt.keyCode === 37) {
            // arrow left -> rewind 5 seconds or selected beats if tempo is set
            player.back();
        } else if (evt.keyCode === 39) {
            // arrow right -> forward 5 seconds or selected beats if tempo is set
            player.forward();
        } else if (evt.keyCode === 38) {
            // arrow up -> volume up
            player.loader();
        } else if (evt.keyCode === 40) {
            // arrow down -> volume down
            player.leiser();
        } else if (evt.keyCode === 171) {
            // + -> faster
            player.faster();
        } else if (evt.keyCode === 173) {
            // - -> slower
            player.slower();
        } else if (evt.keyCode === 163) {
            // # -> reset playbackRate
            player.resetSpeed();
        } else if (evt.keyCode === 66) {
            // b -> record beat tempo, B -> reset beat tempo
            if (! evt.shiftKey) {
                player.setBeat();
            } else {
                player.clearBeat();
            }
        } else if (evt.keyCode === 76) {
            // l -> set loop, L -> clear loop
            if (! evt.shiftKey) {
                player.setLoop();
            } else {
                player.clearLoop();
            }
        } else {
             //console.log("pressed key:", evt.keyCode);
        }
    };
}, false);