/*
 * 
 * Los amoi! Javascript library
 * 
 */

/* eslint-env browser */

window.addEventListener('load', function () {
    var audio, nodes, util, values, output, player, clickAudioControl;
    audio = document.querySelector('audio');
    nodes = {
        selectAudioFile : document.querySelector('#audiofile'),
        spanPlayPause : document.querySelector('#playpause'),
        rangeTimeline : document.querySelector('#timeline'),
        rangeVolume : document.querySelector('#volume'),
        spanMute : document.querySelector('#mute'),
        beatsMinus : document.querySelector('#beatsMinus'),
        beatsPlus : document.querySelector('#beatsPlus'),
        toolControls : document.querySelector('#toolControls'),
    };
    util = {
        secs2mmss : function (secs) {
            var mm = Math.floor(secs / 60.0);
            var ss = Math.floor(secs % 60);
            return mm + ":" + (ss < 10 ? "0" : "") + ss;
        },
        updateTimeline : function () {
            output.elapsed.value = util.secs2mmss(audio.currentTime);
            nodes.rangeTimeline.value = audio.currentTime;
        },
        setVolumeIcon : function () {
            if (audio.muted) {
                nodes.spanMute.innerHTML = "🔇";
                audio.volume = 0.0;
                nodes.rangeVolume.value = 0.0;
            } else {
                nodes.spanMute.innerHTML = "🔊";
                if (audio.volume === 0.0) {
                    audio.volume = 1.0;
                    nodes.rangeVolume.value = 100.0;
                }
            }
        }
    };
    values = {
        duration : 0,
        lastBeatTime : null
    };
    output = {
        elapsed : document.querySelector('#elapsed'),
        duration : document.querySelector('#duration'),
        playbackrate : document.querySelector('#playbackrate'),
        beat : document.querySelector('#beat'),
        beatsBack : document.querySelector('#beatsBack'),
        loopFrom : document.querySelector("#loopFrom"),
        loopTo : document.querySelector("#loopTo"),
    };
    player = {
        play : function () {
            audio.play();
            nodes.spanPlayPause.innerHTML = "⏸";
        },
        pause : function () {
            if (audio.paused) {
                audio.play();
                nodes.spanPlayPause.innerHTML = "⏸";
            } else {
                audio.pause();
                nodes.spanPlayPause.innerHTML = "▶️";
            }
        },
        stop : function () {
            audio.pause();
            audio.currentTime = 0;
            nodes.spanPlayPause.innerHTML = "▶️";
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
                nodes.beatsMinus.parentNode.style.display = "inline-block";
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
                output.loopFrom.value = audio.currentTime.toFixed(2);
            } else if (! output.loopTo.value) {
                // set end of loop
                output.loopTo.value = audio.currentTime.toFixed(2);
            } else {
                // start new loop
                output.loopFrom.value = audio.currentTime.toFixed(2);
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
        // set audio
        audio.src = window.URL.createObjectURL(evt.target.files[0]);
        audio.oncanplay = function (evt) {
            // set song duration
            values.duration = evt.target.duration;

            // set overall time
            output.duration.value = " / " + util.secs2mmss(Math.round(values.duration));

            // set player control labels and slider
            util.updateTimeline();
        };

        // do stuff while playing
        audio.ontimeupdate = function () {
            // update timeline and elapsed label
            nodes.rangeTimeline.value = 100.0 / values.duration * audio.currentTime;
            output.elapsed.value = util.secs2mmss(Math.floor(audio.currentTime));

            // loop between to timestamps if they are set
            if (output.loopFrom.value && output.loopTo.value) {
                if (audio.currentTime > output.loopTo.value) {
                    audio.currentTime = output.loopFrom.value;
                }
            }
        }

    };

    // activate play/pause
    nodes.spanPlayPause.onclick = function () {
        if (audio.paused) {
            player.play();
        } else {
            player.pause();
        }
    };

    // activate timeline
    nodes.rangeTimeline.onchange = function () {
        audio.currentTime = values.duration / 100.0 * nodes.rangeTimeline.value;
        util.updateTimeline();
    };

    // activate volume control
    nodes.rangeVolume.onchange = function () {
        audio.volume = nodes.rangeVolume.value / 100.0;
        audio.muted = (audio.volume === 0.0) ? true : false;
        util.setVolumeIcon();
    };
    nodes.spanMute.onclick = function () {
        audio.muted = (audio.muted === true) ? false : true;
        util.setVolumeIcon();
    }

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

    // implement (some) winamp shortcuts, see https://shortcutworld.com/en/Winamp/win/all
    document.onkeydown = clickAudioControl = function (evt) {
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
        } else if (evt.keyCode === 77) {
            // mute / unmute
            audio.muted = (audio.muted === true) ? false : true;
            util.setVolumeIcon();
        } else {
             //console.log("pressed key:", evt.keyCode);
        }
    };

    // map clicks on audio controls to keyboard shortcut events
    nodes.toolControls.onclick = nodes.toolControls.ondblclick = function (evt) {
        if (evt.type === 'click') {
            clickAudioControl({
                keyCode : parseInt(evt.target.getAttribute("data-keycode"))
            });
        } else {
            // map doubleclick to shiftKey
            clickAudioControl({
                keyCode : parseInt(evt.target.getAttribute("data-keycode")),
                shiftKey : true
            });
            window.getSelection().removeAllRanges();
        }
    };

}, false);
