const exportBtn = document.getElementById("test");

exportBtn!.addEventListener("click", () => {
  console.log("test clicked");
  chrome.runtime.sendMessage({ action: "test" });
});
