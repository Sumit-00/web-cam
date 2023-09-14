setTimeout(() => {
    if(db) {
        showImagesAndVideos("videos")
        showImagesAndVideos("images")
    }
}, 300)


function showImagesAndVideos(type) {
    let dbTransaction = db.transaction(type, "readonly");
    const store = dbTransaction.objectStore(type);
    const data = store.getAll();
    data.onsuccess = function() {
        const result = data.result;
        const galleryCont = document.querySelector(".gallery-cont")
        result.forEach((resultObj) => {
            const mediaEle = document.createElement("div");
            mediaEle.setAttribute("class", "media-cont");
            mediaEle.setAttribute("id", resultObj.id);
            const url = type === "videos" ? URL.createObjectURL(resultObj.blobData) : resultObj.url

            mediaEle.innerHTML = `
                <div class="media">
                    ${type === "videos" ? `<video autoplay loop src=${url}></video>` : `<img src="${url}" />`}
                </div>
                <div class="action-cont">
                    <div class="${resultObj.id}-download download">Download</div>
                    <div class="${resultObj.id}-delete delete">Delete</div>
                </div>
            `
            galleryCont.appendChild(mediaEle);
            const deleteBtn = document.querySelector(`.${resultObj.id}-delete`);
            const downloadBtn = document.querySelector(`.${resultObj.id}-download`);

            const blobData = type === "videos" ? resultObj.blobData : resultObj.url


            // using closure to access the type and blobData
            function createDownloadFunction(type, blobData) {
                return function() {
                    if(type === "videos") {
                        const videoURL = URL.createObjectURL(blobData);
                
                        const a = document.createElement("a");
                        a.href = videoURL;
                        a.download = "video.mp4";
                        a.click();
                    }else {
                        const a = document.createElement("a");
                        a.href = blobData;
                        a.download = "image.jpg"
                        a.click();
                    }
                }
            }

            function createDeleteFunction(e) {
                let dbTransaction = db.transaction(type, "readwrite");
                const store = dbTransaction.objectStore(type);
                store.delete(resultObj.id)
                e.target.parentElement.parentElement.remove();
            }

            const downloadFunction = createDownloadFunction(type, blobData)
            deleteBtn.addEventListener("click", createDeleteFunction);
            downloadBtn.addEventListener("click", downloadFunction);
        })
    }
}
