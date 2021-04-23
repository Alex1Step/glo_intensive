const API_KEY = "AIzaSyBKCuMSDnxnVffTFYX_I7JyABuL8XfOFsk";
const CLIENT_ID =
  "209354604196-0riptdgdnlr1aqd2arqrlvoacaku1ess.apps.googleusercontent.com";

const gloAcademyList = document.querySelector(".glo-academy-list");
const trendingList = document.querySelector(".trending-list");
const musicList = document.querySelector(".music-list");

const createCard = (dataVideo) => {
  console.log(dataVideo.snippet.resourceId.videoId);
  const card = document.createElement("div");
  card.classList.add("video-card");

  const imgUrl = dataVideo.snippet.thumbnails.high.url;
  const videoId = dataVideo.snippet.resourceId.videoId;
  // typeof dataVideo.id === "string" ? dataVideo.id : dataVideo.id.videoId;
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

// createList(gloAcademyList, gloAcademy);
// createList(trendingList, trending);
// createList(musicList, music);

//authorization in google

const authBtn = document.querySelector(".auth-btn");
const userAvatar = document.querySelector(".user-avatar");

//button and avatar after succes auth
const handleSuccesAuth = (data) => {
  authBtn.classList.add("hide");
  userAvatar.classList.remove("hide");
  userAvatar.src = data.getImageUrl();
  userAvatar.alt = data.getName();

  getVideoFromChannel();
};
//button and avatar after invalid auth
const handleNoAuth = () => {
  authBtn.classList.remove("hide");
  userAvatar.classList.add("hide");
  userAvatar.src = "";
  userAvatar.alt = "";
};
//sign in handler
const handleSignIn = () => {
  gapi.auth2.getAuthInstance().signIn();
};
//sign out handler
const handleSignOut = () => {
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
      authBtn.addEventListener("click", handleSignIn);
      userAvatar.addEventListener("click", handleSignOut);
    })
    .catch(() => {});
}
//initialize Google API
gapi.load("client:auth2", initClient);

//function for get video from channel
const getVideoFromChannel = () => {
  gapi.client.youtube.channels
    .list({
      part: "snippet, statistics, contentDetails",
      id: "UC6cqazSR6CnVMClY0bJI0Lg",
    })
    .then((response) => {
      gapi.client.youtube.playlistItems
        .list({
          part: "snippet, id",
          maxResults: 6,
          playlistId:
            response.result.items[0].contentDetails.relatedPlaylists.uploads,
        })
        .then((response) => {
          createList(gloAcademyList, response.result.items);
          console.log(response);
        });
    });
};
