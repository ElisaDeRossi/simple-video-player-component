import { useRef } from 'react';
import './VideoPlayer.css';

export default function VideoPlayer({ src }) {
    let containerRef = useRef(null);
    let uiRef = useRef(null);
    let videoRef = useRef(null);
    let volumeRef = useRef(null);
    let progressRef = useRef(null);
    let totalTimeRef = useRef(null);
    let currentTimeRef = useRef(null);

    let refSvgPlay = useRef(null);
    let refSvgPause = useRef(null);
    let refSvgMute = useRef(null);
    let refSvgVolume = useRef(null);
    let refSvgFullsecreen = useRef(null);
    let refSvgUnFullsecreen = useRef(null);

    function timeToHHMMSS(time) {
        let hours = Math.floor(time / 3600);
        time = time - hours * 3600;
        let minutes = Math.floor(time / 60);
        let seconds = Math.round(time - minutes * 60);

        if (minutes < 10) minutes = `0${minutes}`;
        if (seconds < 10) seconds = `0${seconds}`;

        if (hours === 0)
            return `${minutes}:${seconds}`;

        if (hours < 10) hours = `0${hours}`;
        return `${hours}:${minutes}:${seconds}`;
    }

    function setProgressSetVolume() {
        const video = videoRef.current;
        const volume = volumeRef.current;
        const progress = progressRef.current;
        video.volume = volume.value;
        updateInputRange(volume, video.volume);
        progress.setAttribute("max", video.duration);
        updateInputRange(progress, 0);
        totalTimeRef.current.innerHTML = timeToHHMMSS(video.duration);
        currentTimeRef.current.innerHTML = timeToHHMMSS(0);

        setTimer();
    }

    function updateInputRange(element, value) {
        element.style.setProperty('--value', `${(value - element.min) / (element.max - element.min) * 100}%`);
    }

    function updateTime() {
        const video = videoRef.current;
        const progress = progressRef.current;
        progress.value = video.currentTime;
        currentTimeRef.current.innerHTML = timeToHHMMSS(video.currentTime);

        updateInputRange(progress, video.currentTime);
    }

    function playPause() {
        const video = videoRef.current;
        if (video.paused || video.ended) {
            video.play();
            refSvgPlay.current.style.display = "none";
            refSvgPause.current.style.display = "block";
        } else {
            video.pause();
            refSvgPlay.current.style.display = "block";
            refSvgPause.current.style.display = "none";
        }
    }

    let lastVolumeLevel = 1;
    function muteVideo() {
        const video = videoRef.current;
        const volume = volumeRef.current;
        if (video.volume > 0) {
            lastVolumeLevel = video.volume;
            video.volume = 0;
            volume.value = 0;
            refSvgVolume.current.style.display = "none";
            refSvgMute.current.style.display = "block";
        } else {
            video.volume = lastVolumeLevel;
            volume.value = lastVolumeLevel;
            refSvgVolume.current.style.display = "block";
            refSvgMute.current.style.display = "none";
        }

        updateInputRange(volume, video.volume);
    }

    function toggleFullscreen() {
        const videoContainer = containerRef.current;

        if ( // If is in fullscreen
            (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement && document.msFullscreenElement !== null)
        ) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {     // Safari
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {      // Firefox
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {         // IE11
                document.msExitFullscreen();
            }

            refSvgFullsecreen.current.style.display = "block";
            refSvgUnFullsecreen.current.style.display = "none";
        } else {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.webkitRequestFullscreen) {    // Safari
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.mozRequestFullScreen) {       // Firefox
                videoContainer.mozRequestFullScreen();
            } else if (videoContainer.msRequestFullscreen) {        // IE11
                videoContainer.msRequestFullscreen();
            }

            refSvgFullsecreen.current.style.display = "none";
            refSvgUnFullsecreen.current.style.display = "block";
        }
    }

    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    document.addEventListener('MSFullscreenChange', exitHandler);

    function exitHandler() {
        if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            refSvgFullsecreen.current.style.display = "block";
            refSvgUnFullsecreen.current.style.display = "none";
        }
    }

    function changeVolume() {
        const video = videoRef.current;
        const volume = volumeRef.current;
        video.volume = volume.value;

        if (video.volume === 0) {
            refSvgVolume.current.style.display = "none";
            refSvgMute.current.style.display = "block";
        } else {
            refSvgVolume.current.style.display = "block";
            refSvgMute.current.style.display = "none";
        }

        updateInputRange(volume, video.volume);
    }

    function changeProgress() {
        const progress = progressRef.current;
        videoRef.current.currentTime = progress.value;
        updateInputRange(progress, progress.value);
    }

    function resetProgress() {
        refSvgPlay.current.style.display = "block";
        refSvgPause.current.style.display = "none";
        const progress = progressRef.current;
        progress.value = 0;
        currentTimeRef.current.innerHTML = timeToHHMMSS(0);
        updateInputRange(progress, 0);
    }

    let timer = null;
    function clearTimer() {
        uiRef.current.style.display = "block";
        containerRef.current.style.cursor = "";
        if (timer)
            clearTimeout(timer);
    }

    function setTimer() {
        clearTimer();
        timer = setTimeout(() => {
            uiRef.current.style.display = "none";
            containerRef.current.style.cursor = "none";
        }, 3000);
    }

    return (
        <div ref={containerRef} id="video-container">
            <div ref={uiRef} id="ui" onMouseOver={clearTimer} onMouseLeave={setTimer}>
                <div id="progress">
                    <p ref={currentTimeRef} id="current-time">--:--</p>
                    <input ref={progressRef} type="range" min="0" step="any" defaultValue="0" onChange={changeProgress} />
                    <p ref={totalTimeRef} id="total-time">--:--</p>
                </div>
                <div id="controls">
                    <div id="left-group">
                        <button onClick={playPause}>
                            <svg ref={refSvgPlay} id="svg-play" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 3.8778314,31.931727 C 2.8246803,31.725283 2.0167736,30.807909 1.7087547,29.46875 1.5990577,28.991826 1.59375,28.370216 1.59375,16 1.59375,3.6297841 1.5990577,3.008174 1.7087547,2.53125 2.076317,0.93321754 3.1095057,0 4.5111655,0 4.9670063,0 5.7168895,0.19598945 6.28125,0.46262925 6.9835992,0.79446365 28.112898,12.903469 28.738783,13.332834 c 0.251644,0.17263 0.620284,0.491486 0.819201,0.708569 1.358805,1.482897 1.026445,3.359629 -0.819201,4.625763 C 28.112898,19.096531 6.9835992,31.205536 6.28125,31.537371 5.4299809,31.939564 4.6068269,32.074629 3.8778314,31.931727 Z"></path></svg>
                            <svg ref={refSvgPause} id="svg-pause" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 8.3242231,29.902814 C 7.8067321,29.77776 7.3996305,29.552729 6.9647146,29.151328 6.5337932,28.753614 6.1856477,28.130219 6.0813692,27.569594 5.9955576,27.108253 5.9955576,4.8917471 6.0813692,4.4304056 6.1856477,3.8697814 6.5337932,3.246386 6.9647146,2.8486716 7.6607363,2.2062858 8.2717182,2.0024246 9.505456,2.0009238 c 0.4177031,-5.081e-4 0.911306,0.027784 1.096896,0.06287 1.153538,0.2180823 2.163082,1.2237848 2.375653,2.3666115 0.04024,0.2163203 0.06229,4.3604307 0.06169,11.5937504 -0.001,12.227779 0.01514,11.644527 -0.341783,12.346684 -0.08554,0.168269 -0.314412,0.477033 -0.508614,0.686142 -0.398958,0.429579 -1.024301,0.77664 -1.586677,0.880594 -0.481374,0.08898 -1.8529304,0.06805 -2.2784009,-0.03476 z m 13.0406239,0 c -0.517491,-0.125054 -0.924592,-0.350085 -1.359508,-0.751486 -0.430921,-0.397714 -0.779067,-1.021109 -0.883345,-1.581734 -0.08581,-0.461341 -0.08581,-22.6778469 0,-23.1391884 0.104278,-0.5606242 0.452424,-1.1840196 0.883345,-1.581734 0.696022,-0.6423858 1.307004,-0.846247 2.540741,-0.8477478 0.417703,-5.081e-4 0.911307,0.027784 1.096897,0.06287 1.153537,0.2180823 2.163081,1.2237848 2.375652,2.3666115 0.04024,0.2163203 0.06229,4.3604307 0.06169,11.5937504 -0.001,12.227779 0.01514,11.644527 -0.341783,12.346684 -0.08554,0.168269 -0.314411,0.477033 -0.508614,0.686142 -0.398957,0.429579 -1.024301,0.77664 -1.586677,0.880594 -0.481373,0.08898 -1.85293,0.06805 -2.278401,-0.03476 z"></path></svg>
                        </button>
                        <button onClick={muteVideo}>                            
                            <svg ref={refSvgMute} id="svg-mute" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="m 18.265496,31.022015 c -0.07741,-0.01691 -2.580539,-1.771699 -5.5625,-3.899534 L 7.28125,23.25369 4.4653965,23.251845 1.649543,23.25 1.3298593,23.090695 C 0.97371502,22.913221 0.72843081,22.631726 0.59132898,22.243138 0.45447661,21.855257 0.45447661,10.144743 0.59132898,9.7568619 0.72843081,9.3682739 0.97371502,9.0867793 1.3298593,8.9093051 L 1.649543,8.75 4.4653965,8.7480782 7.28125,8.7461565 12.625,4.9300901 c 2.939063,-2.0988366 5.414062,-3.8452012 5.5,-3.8808104 0.715892,-0.2966382 1.599205,0.033145 1.932414,0.7214641 l 0.130903,0.2704095 -0.01603,14.0365437 -0.01603,14.036543 -0.189245,0.26926 c -0.313779,0.446446 -0.632045,0.629212 -1.133342,0.650827 -0.235077,0.01014 -0.490752,0.0046 -0.568167,-0.01231 z m 5.468752,-10.736187 c -0.777654,-0.277517 -1.199185,-1.207632 -0.888147,-1.95971 0.05988,-0.144799 0.489165,-0.626578 1.13911,-1.278417 l 1.043009,-1.046048 -1.070902,-1.078952 c -0.919913,-0.926828 -1.081433,-1.118536 -1.145594,-1.359711 -0.311323,-1.170222 0.700817,-2.190363 1.858687,-1.87338 0.260932,0.07143 0.43272,0.214247 1.370079,1.138993 l 1.071739,1.05732 1.016943,-1.009316 c 0.559318,-0.555123 1.099731,-1.052127 1.200917,-1.104453 0.296138,-0.153139 0.795876,-0.177638 1.159545,-0.05685 0.40255,0.133706 0.831187,0.586708 0.947191,1.001033 0.09135,0.326251 0.05168,0.750472 -0.09822,1.050362 -0.05554,0.111126 -0.554916,0.659079 -1.109713,1.217673 L 29.220171,16 l 1.008722,1.015625 c 0.554797,0.558594 1.054168,1.106547 1.109713,1.217673 0.05554,0.111126 0.118349,0.328693 0.139565,0.483481 0.11441,0.834716 -0.621306,1.658221 -1.481447,1.658221 -0.521,0 -0.723219,-0.136874 -1.823263,-1.234096 l -1.045288,-1.042606 -1.079712,1.063882 c -0.863459,0.850801 -1.131235,1.078797 -1.336962,1.138351 -0.331232,0.09588 -0.682158,0.09061 -0.977251,-0.0147 z"></path></svg>
                            <svg ref={refSvgVolume} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="m 17.78125,30.861357 c -0.103125,-0.03645 -2.555518,-1.959685 -5.449762,-4.273852 L 7.0692254,22.379929 4.3002377,22.361839 C 1.5712966,22.344012 1.5271141,22.341712 1.2452769,22.202827 0.78052149,21.973803 0.46076853,21.656354 0.23699991,21.201816 L 0.03125,20.783878 V 16 11.216122 L 0.23699991,10.798184 C 0.46068857,10.343808 0.77317329,10.033414 1.2414922,9.8004124 1.52912,9.6573097 1.5516026,9.656117 4.2999865,9.6381614 l 2.7687364,-0.018089 5.3040211,-4.242902 c 4.816062,-3.8525629 5.329822,-4.246771 5.584466,-4.2849572 0.481048,-0.072138 0.899403,0.1387306 1.100856,0.554876 L 19.1875,1.9144655 V 16.009903 30.10534 l -0.143921,0.272159 c -0.240533,0.454853 -0.770106,0.657842 -1.262329,0.483858 z m 8.747769,-4.066443 c -0.44673,-0.179332 -0.715909,-0.541121 -0.716285,-0.96272 -3.53e-4,-0.394965 0.07869,-0.538332 0.641596,-1.163683 0.965079,-1.072141 1.548227,-1.921346 2.111434,-3.074761 C 30.911373,16.790086 30.032459,11.142845 26.321876,7.1762206 26.113,6.9529311 25.912941,6.6935424 25.877301,6.5998011 25.646523,5.9928106 26.031237,5.2903129 26.666645,5.1584375 c 0.399273,-0.082867 0.703775,0.063759 1.211071,0.5831609 1.751383,1.7931767 3.117391,4.2966446 3.70475,6.7896516 0.299427,1.2709 0.38165,2.018213 0.38165,3.46875 0,1.450537 -0.08222,2.19785 -0.38165,3.46875 -0.463359,1.966697 -1.395035,3.918719 -2.669828,5.59375 -0.496687,0.652629 -1.32716,1.547407 -1.536831,1.655833 -0.252668,0.13066 -0.627606,0.164568 -0.846788,0.07658 z M 23.651915,23.811088 C 23.1388,23.702271 22.81233,23.298319 22.812734,22.77274 c 2.8e-4,-0.365148 0.08818,-0.519498 0.65273,-1.146222 0.744608,-0.826607 1.334466,-1.840389 1.694028,-2.911505 0.571212,-1.701612 0.571212,-3.728414 0,-5.430026 -0.359562,-1.071116 -0.94942,-2.084898 -1.694028,-2.911505 -0.568061,-0.6306183 -0.652497,-0.7800452 -0.652497,-1.154732 0,-0.5177831 0.309889,-0.9140318 0.798401,-1.0209012 0.456992,-0.099974 0.737188,0.013417 1.193594,0.4830286 3.541499,3.6439716 3.900953,9.5810226 0.827207,13.6628726 -0.394098,0.523351 -0.992212,1.194573 -1.165832,1.308334 -0.202408,0.132622 -0.585835,0.207481 -0.814422,0.159004 z"></path></svg>
                        </button>
                        <input ref={volumeRef} type="range" min="0" max="1" step="0.01" defaultValue="1" onChange={changeVolume} />
                    </div>
                    <button onClick={toggleFullscreen}>
                        <svg ref={refSvgFullsecreen} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 1.46875,31.914087 C 0.88563886,31.728041 0.51990396,31.432452 0.24460002,30.924722 L 0.03125,30.53125 v -4.1875 -4.1875 l 0.15475881,-0.3125 C 0.38409415,21.443762 0.8008518,21.027197 1.1752277,20.854988 1.4024257,20.750479 1.5887913,20.719833 2,20.719361 c 0.4565548,-5.25e-4 0.5815528,0.02409 0.8890154,0.175073 0.3930404,0.193007 0.7137648,0.526239 0.9355722,0.972058 0.1434711,0.288369 0.1442511,0.303755 0.1626593,3.208761 l 0.018497,2.919003 2.9190031,0.0185 2.9190031,0.0185 0.3125,0.154759 c 0.399988,0.198085 0.816553,0.614843 0.988762,0.989219 0.190915,0.415043 0.190915,1.234501 0,1.649544 -0.172209,0.374376 -0.588774,0.791134 -0.988762,0.989219 l -0.3125,0.154759 -4.0625,0.01255 c -3.1507707,0.0097 -4.1186064,-0.0053 -4.3125,-0.06721 z m 20.75,0.02865 C 21.655922,31.80394 21.093203,31.342644 20.854988,30.824772 20.750243,30.59706 20.719971,30.412139 20.719971,30 c 0,-0.412139 0.03027,-0.59706 0.135017,-0.824772 0.172209,-0.374376 0.588774,-0.791134 0.988762,-0.989219 l 0.3125,-0.154759 2.919003,-0.0185 2.919003,-0.0185 0.0185,-2.919003 0.0185,-2.919003 0.154759,-0.3125 c 0.198085,-0.399988 0.614843,-0.816553 0.989219,-0.988762 0.227198,-0.104509 0.413563,-0.135155 0.824772,-0.135627 0.456555,-5.25e-4 0.581553,0.02409 0.889015,0.175073 0.393041,0.193007 0.713765,0.526239 0.935573,0.972058 l 0.144162,0.289758 v 4.15625 4.15625 l -0.163738,0.349155 c -0.208129,0.443812 -0.543295,0.778978 -0.987107,0.987107 l -0.349155,0.163738 -4.03125,0.01011 c -2.217188,0.0056 -4.115625,-0.0107 -4.21875,-0.03613 z M 1.3432674,11.203982 C 0.94719805,11.062223 0.60180038,10.799824 0.38183946,10.473584 0.01670739,9.9320316 0.03125,10.133153 0.03125,5.625 V 1.46875 L 0.24479465,1.0749133 C 0.48197997,0.63747652 0.67665496,0.44914691 1.1495347,0.19966297 L 1.46875,0.03125 h 4.1875 4.1875 l 0.3125,0.15475881 c 0.399988,0.19808534 0.816553,0.61484299 0.988762,0.98921889 0.190915,0.4150428 0.190915,1.2345018 0,1.6495446 -0.172209,0.3743759 -0.588774,0.7911335 -0.988762,0.9892189 L 9.84375,3.96875 6.9247469,3.9872469 4.0057438,4.0057438 3.9872469,6.9247469 c -0.018408,2.9050059 -0.019188,2.9203925 -0.1626593,3.2087611 -0.3636293,0.730873 -0.9389255,1.118583 -1.7200405,1.15919 -0.3216677,0.01672 -0.5367046,-0.0083 -0.7612797,-0.08872 z m 27.9999996,0 C 28.946192,11.061862 28.600794,10.799012 28.383494,10.473584 28.016952,9.9246544 28.032719,10.075577 28.012753,6.9247469 L 27.994256,4.0057438 25.075253,3.9872469 22.15625,3.96875 21.84375,3.8139912 c -0.399988,-0.1980854 -0.816553,-0.614843 -0.988762,-0.9892189 -0.190915,-0.4150428 -0.190915,-1.2345018 0,-1.6495446 0.172209,-0.3743759 0.588774,-0.79113355 0.988762,-0.98921889 L 22.15625,0.03125 h 4.1875 4.1875 l 0.393472,0.21335002 c 0.427767,0.231946 0.687983,0.51519632 0.904719,0.98480618 L 31.96875,1.53125 V 5.6875 9.84375 l -0.144162,0.289758 c -0.36363,0.730873 -0.938926,1.118583 -1.720041,1.15919 -0.321668,0.01672 -0.536704,-0.0083 -0.76128,-0.08872 z"></path></svg>
                        <svg ref={refSvgUnFullsecreen} id="svg-unfullscreen" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 10.593697,31.604532 C 10.23434,31.486474 9.8473328,31.213285 9.6638816,30.948174 9.3070242,30.432469 9.3125,30.504805 9.3125,26.306419 V 22.441053 L 5.328125,22.423652 1.34375,22.40625 1.03125,22.239956 C 0.35048866,21.877694 0.03058912,21.328935 0.03515918,20.53125 0.03752919,20.117575 0.06614987,19.977297 0.2009311,19.71875 0.3942626,19.347888 0.67696697,19.068115 1.0625,18.866112 L 1.34375,18.71875 H 6.5 11.65625 l 0.307211,0.151204 c 0.378509,0.186296 0.726445,0.536913 0.920686,0.927782 l 0.147103,0.296014 v 5.09375 c 0,5.047229 -0.0012,5.096348 -0.131604,5.378175 -0.308322,0.666356 -0.893354,1.059138 -1.63644,1.098684 -0.24092,0.01282 -0.525888,-0.01264 -0.669509,-0.05983 z m 9.776887,1.6e-4 c -0.693903,-0.193539 -1.139983,-0.628449 -1.335927,-1.302473 -0.08964,-0.308357 -0.09886,-0.895274 -0.08334,-5.308827 l 0.01744,-4.962142 0.153286,-0.311511 c 0.211188,-0.429182 0.621359,-0.809903 1.042183,-0.967353 0.343657,-0.128578 0.412321,-0.130021 5.388812,-0.113187 5.010031,0.01695 5.042491,0.01787 5.33174,0.151572 0.837606,0.387174 1.2648,1.439566 0.954285,2.350878 -0.129284,0.379428 -0.526266,0.822793 -0.925097,1.033184 l -0.320209,0.168917 -3.951351,0.01783 -3.951352,0.01783 -0.0174,3.982167 -0.0174,3.982167 -0.167861,0.318126 c -0.400301,0.75864 -1.316214,1.166391 -2.117805,0.942816 z M 1.3233323,13.282248 C 0.55175192,13.041458 0.07124631,12.367622 0.0652433,11.51797 0.05996988,10.771582 0.43534895,10.164264 1.125,9.8034111 L 1.40625,9.65625 5.3576015,9.6384172 9.308953,9.6205844 9.3263515,5.6384172 9.34375,1.65625 9.5283719,1.322955 C 9.7487346,0.9251378 9.975509,0.7220798 10.4375,0.5089051 c 0.903876,-0.41707222 2.026079,0.0167771 2.446046,0.9456543 L 13.03125,1.78125 V 6.875 11.96875 l -0.154648,0.3125 c -0.212445,0.429292 -0.620706,0.809179 -1.03701,0.964938 -0.337404,0.126239 -0.443175,0.128728 -5.2950615,0.124631 -3.972295,-0.0034 -5.0042266,-0.02086 -5.2211982,-0.08857 z M 20.268322,13.222698 C 19.781852,13.069284 19.326088,12.650469 19.073783,12.125 18.978054,11.925627 18.96875,11.455033 18.96875,6.8125 V 1.71875 l 0.153613,-0.309863 c 0.195493,-0.3943416 0.522139,-0.72098789 0.913705,-0.91370505 0.426847,-0.21008151 1.184502,-0.21458502 1.571569,-0.009341 0.424886,0.22529655 0.712023,0.51808509 0.902088,0.91984129 l 0.177676,0.3755682 5e-5,3.8888485 4.9e-5,3.8888485 3.984375,0.017402 3.984375,0.017402 0.3125,0.1662942 c 0.668023,0.3554828 0.997827,0.9105098 0.996766,1.6774558 -0.0011,0.794352 -0.367082,1.381726 -1.059266,1.700041 l -0.3125,0.143709 -5.03125,0.01218 c -4.032965,0.0098 -5.083419,-0.0043 -5.294178,-0.07074 z"></path></svg>
                    </button>
                </div>
            </div>

            <video ref={videoRef} onLoadedMetadata={setProgressSetVolume} onTimeUpdate={updateTime} onClick={playPause} onEnded={resetProgress} onMouseMove={setTimer} controls>
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}