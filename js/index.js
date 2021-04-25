/*CONSTANTS*/
//1st
const API_KEY = "AIzaSyBKCuMSDnxnVffTFYX_I7JyABuL8XfOFsk";
const CLIENT_ID =
  "209354604196-0riptdgdnlr1aqd2arqrlvoacaku1ess.apps.googleusercontent.com";
//2nd
// const API_KEY = "AIzaSyC55VhD2V49BEIkvrylCZJ4eJdHZztoqiQ";
// const CLIENT_ID =
//   "555793957146-k8l74kh7nhp9ep2i8eg9estn1olds5cj.apps.googleusercontent.com";

/*ELEMENTS FOR WORK*/

const gloAcademyList = document.querySelector(".glo-academy-list");
const gloAcademyListTitle = document.getElementsByClassName("channel-text")[0];
console.log(gloAcademyListTitle);
const gloAcademyListAvatar = document.getElementsByClassName(
  "channel-avatar"
)[0];
const trendingList = document.querySelector(".trending-list");
const musicList = document.querySelector(".music-list");
const navMenuMore = document.querySelector(".nav-menu-more");
const showMore = document.querySelector(".show-more");
const formSearch = document.querySelector(".form-search");
const subscr = document.querySelector(".subscriptions");
//authorization in google
const authBtn = document.querySelector(".auth-btn");
const userAvatar = document.querySelector(".user-avatar");

/*FUNCTIONS*/

const createCard = (dataVideo) => {
  const card = document.createElement("div");
  card.classList.add("video-card");

  const imgUrl = dataVideo.snippet.thumbnails.high.url;
  let videoId;
  if ("resourceId" in dataVideo.snippet)
    videoId = dataVideo.snippet.resourceId.videoId;
  else
    videoId =
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

//create list of subscriptions
const createSubscrItem = (item) => {
  const sub = document.createElement("li");
  sub.classList.add("nav-item");
  const channelTitle = item.snippet.title;
  const channelSrcImg = item.snippet.thumbnails.default.url;
  const channelLink = item.snippet.resourceId.channelId;

  sub.innerHTML = `
  <a href="https://www.youtube.com/channel/${channelLink}" class="nav-link">
    <img src="${channelSrcImg}" alt="Photo: ${channelTitle}" class="nav-image">
    <span class="nav-text">${channelTitle}</span>
  </a>
  `;

  return sub;
};

const createSubscrList = (wrapper, listSubscr) => {
  wrapper.textContent = "";
  listSubscr.forEach((element) => {
    const subscrItem = createSubscrItem(element);
    wrapper.append(subscrItem);
  });
};

//button and avatar after succes auth
const handleSuccesAuth = (data) => {
  authBtn.classList.add("hide");
  userAvatar.classList.remove("hide");
  userAvatar.src = data.getImageUrl();
  userAvatar.alt = data.getName();
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
    .then(loadScreen)
    .catch(() => {});
}

// const getVideoFromChannel = (channelId) => {
//   gapi.client.youtube.channels.list({
//     part: "snippet, statistics, contentDetails",
//     id: `${channelId}`,
//   });
// };

//function for get video from channel
const requestVideos = (channelId, callback, maxResults = 6) => {
  gapi.client.youtube.search
    .list({
      part: "snippet",
      channelId,
      maxResults,
      order: "date",
    })
    .then((response) => {
      callback(response.result.items);
    });
};

const requestTrending = (callback, maxResults = 6) => {
  gapi.client.youtube.videos
    .list({
      part: "snippet, statistics",
      chart: "mostPopular",
      regionCode: "RU",
      maxResults,
    })
    .then((response) => {
      callback(response.result.items);
    });
};

const requestMusic = (callback, maxResults = 6) => {
  gapi.client.youtube.videos
    .list({
      part: "snippet, statistics",
      chart: "mostPopular",
      regionCode: "RU",
      videoCategoryId: "10",
      maxResults,
    })
    .then((response) => callback(response.result.items));
};

const requestSubscriptions = (callback, maxResults = 6) => {
  gapi.client.youtube.subscriptions
    .list({
      part: "snippet",
      mine: true,
      order: "relevance",
      maxResults,
    })
    .then((response) => {
      callback(response.result.items);
    });
};

const requestSearch = (searchText, callback, maxResults = 6) => {
  gapi.client.youtube.search
    .list({
      part: "snippet",
      q: searchText,
      maxResults,
      order: "relevance",
    })
    .then((response) => {
      callback(response.result.items);
    });
};

const loadScreen = () => {
  requestVideos("UC6cqazSR6CnVMClY0bJI0Lg", (data) => {
    createList(gloAcademyList, data);
  });
  requestTrending((data) => {
    createList(trendingList, data);
  });
  requestMusic((data) => {
    createList(musicList, data);
  });
  requestSubscriptions((data) => {
    createSubscrList(subscr, data);
  });
};

/*LISTENERS*/

//aside "show more" block show or hide
showMore.addEventListener("click", (e) => {
  e.preventDefault();
  navMenuMore.classList.toggle("nav-menu-more-show");
});

//handler for search form in header
formSearch.addEventListener("submit", (event) => {
  event.preventDefault();
  requestSearch(formSearch.elements.search.value, (data) => {
    createList(gloAcademyList, data);
    gloAcademyListTitle.innerText = "Results";
    gloAcademyListAvatar.classList.toggle("hide");
  });
});

/*INIT Google API*/
gapi.load("client:auth2", initClient);
