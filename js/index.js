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

const content = document.querySelector(".content");
const navMenuMore = document.querySelector(".nav-menu-more");
const showMore = document.querySelector(".show-more");
const formSearch = document.querySelector(".form-search");
const subscr = document.querySelector(".subscriptions");
const likedVideos = document.querySelector(".nav-item-liked");
const likedVideosM = document.querySelector(".nav-item-liked-mobile");
//authorization in google
const authBtn = document.querySelector(".auth-btn");
const userAvatar = document.querySelector(".user-avatar");

/*FUNCTIONS*/

//create lists of videos
const createCard = (dataVideo) => {
  const card = document.createElement("li");
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
    viewsCount = `<span class="video-views">${getViewCount(
      dataVideo.statistics.viewCount
    )}</span>`;

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
          <span class="video-date">${getTimeInterval(dateVideo)}</span>
        </span>
        <span class="video-channel">${channelTitle}</span>
      </div>
  `;
  return card;
};

const getTimeInterval = (date) => {
  const currentTime = Date.parse(new Date());
  const uploadTime = Date.parse(new Date(date));
  const diffDay = Math.round((currentTime - uploadTime) / 86400000);
  if (diffDay > 1) {
    if (diffDay > 730) return Math.round(diffDay / 365) + " years ago";
    if (diffDay > 365) return "One year ago";
    if (diffDay > 60) return Math.round(diffDay / 30) + " month ago";
    if (diffDay < 30) return diffDay + " days ago";
    else return "One month ago";
  }
  return "One day ago";
};

const getViewCount = (count) => {
  if (count >= 1000000) return Math.round(count / 1000000) + "M views";
  if (count >= 1000) return Math.round(count / 1000) + "K views";
  return count + " views";
};

const createList = (listVideo, title, clear) => {
  const channel = document.createElement("section");
  channel.classList.add("channel");

  if (clear) {
    content.textContent = "";
  }

  if (title) {
    const header = document.createElement("h2");
    header.textContent = title;
    channel.insertAdjacentElement("afterbegin", header);
  }

  const wrapper = document.createElement("ul");
  wrapper.classList.add("video-list");

  channel.insertAdjacentElement("beforeend", wrapper);

  listVideo.forEach((element) => {
    const card = createCard(element);
    wrapper.append(card);
  });

  content.insertAdjacentElement("beforeend", channel);
};

//create list of subscriptions
const createSubscrItem = (item) => {
  const sub = document.createElement("li");
  sub.classList.add("nav-item");
  const channelTitle = item.snippet.title;
  const channelSrcImg = item.snippet.thumbnails.default.url;
  const channelLink = item.snippet.resourceId.channelId;

  sub.innerHTML = `
  <a href="https://www.youtube.com/channel/${channelLink}" class="nav-link" data-channel-id="${channelLink}" data-title="${channelTitle}">
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
  requestSubscriptions((data) => {
    createSubscrList(subscr, data);
  });
  loadScreen();
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
  requestTrending((data) => {
    createList(data, "Trend", false);
  }, 18);
};

// work with google API
function initClient() {
  //init GOOGLE client
  gapi.client
    .init({
      apiKey: API_KEY,
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
    // .then(loadScreen)
    .catch((err) => {
      console.error("ERROR: " + err);
    });
}

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
//function for get recomended videos
// const requestRecomendedVideos = (callback, maxResults = 6) => {
//   gapi.client.youtube.activities
//     .list({
//       part: "snippet",
//       maxResults,
//       home: true,
//     })
//     .then((response) => {
//       callback(response.result.items);
//     });
// };
//function for get video from TREND
const requestTrending = (callback, maxResults = 6) => {
  gapi.client.youtube.videos
    .list({
      part: "snippet, statistics",
      chart: "mostPopular",
      regionCode: "BY",
      maxResults,
    })
    .then((response) => {
      callback(response.result.items);
    });
};
//function for get video from CATEGORY MUSIC
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

//function for get users subscriptions
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

//handle search form
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

//function for get videos which user likes
const requestLikedVideos = (callback, maxResults = 12) => {
  gapi.client.youtube.videos
    .list({
      myRating: "like",
      part: "snippet, statistics",
      maxResults,
      order: "relevance",
    })
    .then((response) => {
      callback(response.result.items);
    });
};

//init main content part with videos
const loadScreen = () => {
  content.textContent = "";

  requestVideos("UC6cqazSR6CnVMClY0bJI0Lg", (data) => {
    createList(data, "Bad Comedian", true);

    requestTrending((data) => {
      createList(data, "Trend", false);

      requestMusic((data) => {
        createList(data, "Music", false);
      });
    });
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
    createList(data, "Result", true);
  });
});

//handle click on any subscription
subscr.addEventListener("click", (event) => {
  event.preventDefault();
  const target = event.target;
  const targetLink = target.closest(".nav-link");
  const channelId = targetLink.dataset.channelId;
  const title = targetLink.dataset.title;
  requestVideos(
    channelId,
    (data) => {
      createList(data, title, true);
    },
    18
  );
});

likedVideos.addEventListener("click", (event) => {
  event.preventDefault();
  requestLikedVideos((data) => {
    createList(data, "Liked Videos", true);
  }, 18);
});

likedVideosM.addEventListener("click", (event) => {
  event.preventDefault();
  requestLikedVideos((data) => {
    createList(data, "Liked Videos", true);
  }, 18);
});

/*INIT Google API*/
gapi.load("client:auth2", initClient);
