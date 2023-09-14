const video = document.querySelector("video");
const recordBtnCont = document.querySelector(".record-btn-cont")
const captureBtnCont = document.querySelector(".capture-btn-cont")
const recordBtn = document.querySelector(".record-btn");
const captureBtn = document.querySelector(".capture-btn");
let filterColor = "transparent";

let isRecording = false;
let mediaRecorder;
let chunks = [];

const constraints = {
    video: true,
    audio: true
}


navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream
    mediaRecorder = new MediaRecorder(stream)

    mediaRecorder.addEventListener("start", () => {
        chunks = [];
    })

    mediaRecorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data)
    })

    mediaRecorder.addEventListener("stop", (e) => {
        const blob = new Blob(chunks,{type: "video/mp4"});
        const videoURL = URL.createObjectURL(blob);

        if(db) {
            const videoID = 'id' + (new Date()).getTime();;
            const dbTransaction = db.transaction("videos", "readwrite");
            const videoStore = dbTransaction.objectStore("videos");
            const videoEntry = {
                id: videoID,
                blobData: blob
            }
            videoStore.add(videoEntry)
        }

        // let a = document.createElement("a");
        // a.href = videoURL;
        // a.download = "stream.mp4";
        // a.click(); 
    })
})

recordBtn.addEventListener("click", (e) => {
    if(!mediaRecorder) return

    if(isRecording) {
        mediaRecorder.stop();
        recordBtn.classList.remove("scale-record")
        stopTime();
    }else {
        mediaRecorder.start();
        recordBtn.classList.add("scale-record");
        startTime();
    }
    isRecording = !isRecording
   
})

let timerId;
let counter = 0;
let timer = document.querySelector(".timer");


function startTime() {
    timer.style.display = "block"
    function displayTime() {
        let totalSeconds = counter;
        let hours = Number.parseInt(totalSeconds / 3600);
        totalSeconds = totalSeconds % 3600;
        let mintues = Number.parseInt(totalSeconds / 60);
        totalSeconds = totalSeconds % 60;

        let seconds = totalSeconds

        hours = (hours < 10) ? `0${hours}` : hours
        mintues = (mintues < 10) ? `0${mintues}` : mintues
        seconds = (seconds < 10) ? `0${seconds}` : seconds

        timer.innerText = `${hours}:${mintues}:${seconds}`

        counter++;
    }

    timerId = setInterval(displayTime, 1000)
}

function stopTime() {
    clearInterval(timerId);
    timer.innerText = "00:00:00"
    timer.style.display = "none";
}


captureBtn.addEventListener("click", function() {
    captureBtn.classList.add("scale-capture");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext( "2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, -canvas.width, canvas.height);

    context.fillStyle = filterColor;
    context.fillRect(0, 0, canvas.width, canvas.height)

    const imageURL = canvas.toDataURL();

    if(db) {
        const imageID = 'id' + (new Date()).getTime();;
        const dbTransaction = db.transaction("images", "readwrite");
        const imageStore = dbTransaction.objectStore("images");
        const imageEntry = {
            id: imageID,
            url: imageURL
        }
        imageStore.add(imageEntry)
    }

    setTimeout(() => {
        captureBtn.classList.remove("scale-capture");
    }, 500)

    // let a = document.createElement("a");
    // a.href = imageURL;
    // a.download = "selfie.jpg";
    // a.click();
})

const filterLayer = document.querySelector(".filter-layer");
const allFilters = document.querySelectorAll(".filter");
allFilters.forEach((ele) => {
    ele.addEventListener("click", (e) => {
        filterColor = getComputedStyle(ele).getPropertyValue("background-color");
        console.log(filterColor)
        filterLayer.style.backgroundColor = filterColor
    })
})