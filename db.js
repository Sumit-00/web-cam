let db;
const openRequest = indexedDB.open("myDatabase");

openRequest.addEventListener("success", function() {
      db = openRequest.result
});

openRequest.addEventListener("upgradeneeded", function() {
    db = openRequest.result;
    db.createObjectStore("videos", {keyPath: "id"});
    db.createObjectStore("images", {keyPath: "id"});
});