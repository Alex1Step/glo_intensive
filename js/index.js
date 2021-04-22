const API_KEY = "AIzaSyBKCuMSDnxnVffTFYX_I7JyABuL8XfOFsk";
const CLIENT_ID =
  "209354604196-0riptdgdnlr1aqd2arqrlvoacaku1ess.apps.googleusercontent.com";

const gloAcademyList = document.querySelector(".glo-academy-list");
const trendingList = document.querySelector(".trending-list");
const musicList = document.querySelector(".music-list");

const createCard = (dataVideo) => {
  const card = document.createElement("div");
  card.classList.add("video-card");

  const imgUrl = dataVideo.snippet.thumbnails.high.url;
  const videoId =
    typeof dataVideo.id === "string" ? dataVideo.id : dataVideo.id.videoId;
  const titleVideo = dataVideo.snippet.title;
  const dateVideo = dataVideo.snippet.publishedAt;
  const channelTitle = dataVideo.snippet.channelTitle;
  if (dataVideo.statistics === undefined) viewsCount = "";
  else
    viewsCount = `<span class="video-views">${dataVideo.statistics.viewCount} views</span>`;

  card.innerHTML = `
      <div class="video-thumb">
        <a class="link-video youtube-modal" href="https://www.youtube.com/watch?v=${videoId}">
          <img src="${imgUrl}" alt="" class="thumbnail">
        </a>
      </div>
      <h3 class="video-title">${titleVideo}</h3>
      <div class="video-info">
        <span class="video-counter">
          ${viewsCount}
          <span class="video-date">${new Date(dateVideo).toLocaleString(
            "ru-RU"
          )}</span>
        </span>
        <span class="video-channel">${channelTitle}</span>
      </div>
  `;
  return card;
};

const createList = (wrapper, listVideo) => {
  wrapper.textContent = "";
  listVideo.forEach((element) => {
    const card = createCard(element);
    wrapper.append(card);
  });
};

createList(gloAcademyList, gloAcademy);
createList(trendingList, trending);
createList(musicList, music);

//authorization in google

const authBtn = document.querySelector(".auth-btn");
const userAvatar = document.querySelector(".user-avatar");

//button and avatar after succes auth
const handleSuccesAuth = (data) => {
  console.log(data);
  authBtn.classList.add(".hide");
  userAvatar.classList.remove(".hide");
  userAvatar.src = "";
  userAvatar.alt = "";
};

const handleNoAuth = () => {
  authBtn.classList.remove(".hide");
  userAvatar.classList.add(".hide");
  userAvatar.src = "";
  userAvatar.alt = "";
};

const handleAuth = () => {
  gapi.auth2;
};

const handleSignout = () => {};

const updateStatusAuth = (data) => {
  data.isSignedIn.listen(() => {
    updateStatusAuth();

    if (data.isSignedIn.get()) {
      const userData = data.currentUser.get().getBasicProfile();
      handleSuccesAuth(userData);
    } else {
      handleNoAuth();
    }
  });
};

//google API
var GoogleAuth; // Google Auth object.
function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.metadata.readonly",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      ],
    })
    .then(() => {
      updateStatusAuth(gapi.auth2.getAuthInstance());
    })
    .catch(() => {
      authBtn.removeEventListener("click", handleAuth);
      userAvatar.removeEventListener("click", handleSignout);
    });
}

gapi.load("client:auth2", initClient);

authBtn.addEventListener("click", handleAuth);
userAvatar.addEventListener("click", handleSignout);
