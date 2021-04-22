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
console.log(authBtn, userAvatar);

//button and avatar after succes auth
const handleSuccesAuth = (data) => {
  console.log("login");
  authBtn.classList.add("hide");
  userAvatar.classList.remove("hide");
  userAvatar.src = "123";
  userAvatar.alt = "123";
};
//button and avatar after invalid auth
const handleNoAuth = () => {
  console.log("NO login");
  authBtn.classList.remove("hide");
  userAvatar.classList.add("hide");
  userAvatar.src = "";
  userAvatar.alt = "";
};

const handleAuth = () => {
  gapi.auth2.getAuthInstance().signIn();
};

const handleSignout = () => {
  gapi.auth2.getAuthInstance().signOut();
};

//remember status - signIn or signOut
const updateStatusAuth = (data) => {
  data.isSignedIn.listen(() => {
    updateStatusAuth(data);
  });

  if (data.isSignedIn.get()) {
    const userData = data.currentUser.get().getBasicProfile();
    handleSuccesAuth(userData);
  } else {
    handleNoAuth();
  }
};

// work with google API
function initClient() {
  //init client
  gapi.client
    .init({
      clientId: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
      ],
    })
    .then(() => {
      updateStatusAuth(gapi.auth2.getAuthInstance());
      authBtn.addEventListener("click", handleAuth);
      userAvatar.addEventListener("click", handleSignout);
    })
    .catch(() => {});
}

gapi.load("client:auth2", initClient);
