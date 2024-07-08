let refreshTimeoutId = 0;
let initialized = false;
let occupiedDesks = null;

const initFromSvg = () => {
  const svgData = document.querySelector("svg");
  if (!svgData) {
    // Try again soon
    setTimeout(refresh, 0);
    return;
  }
  svgData.addEventListener("click", (event) => {
    const target = event.target;
    if (!target.classList.contains("desk")) {
      return;
    }
    console.log(target);
    if (deskIsAvailable(target.id)) {
      bookDesk(target.id);
    }
  });
  const desks = svgData.querySelectorAll(".desk");
  occupiedDesks = {};
  for (const desk of desks) {
    desk.classList.add("available");
  }
  initialized = true;
};

const deskIsAvailable = (deskId) => {
  return !occupiedDesks[deskId] || occupiedDesks[deskId].userId === null;
};

const bookedDeskIdForUser = (userId) => {
  for (let bookableId in occupiedDesks) {
    if (occupiedDesks[bookableId]?.userId === userId) {
      return bookableId;
    }
  }
  return null;
};

const freeDesk = async (deskId) => {
  delete occupiedDesks[deskId];
  await fetch(`/unbook/${deskId}`).then(() => {
    refresh();
  });
};

const bookDesk = async (deskId) => {
  console.log("Booking desk " + deskId);
  const existingId = bookedDeskIdForUser(loggedInUserEmail);
  if (existingId) {
    await freeDesk(existingId);
  }
  fetch(
    `/book/${deskId}/${loggedInUserEmail}/${encodeURIComponent(
      loggedInUserAvatar
    )}`
  ).then(() => {
    refresh();
  });
};

const renderAvatar = (deskId, userId, avatarUrl) => {
  const el = document.querySelector("#" + deskId);

  if (userId) {
    const deskWidth = parseInt(el.getAttribute("width"));
    const deskHeight = parseInt(el.getAttribute("height"));
    const size = Math.floor(0.75 * Math.min(deskWidth, deskHeight));
    const x = Math.floor(
      parseInt(el.getAttribute("x")) + (deskWidth - size) / 2
    );
    const y = Math.floor(
      parseInt(el.getAttribute("y")) + (deskHeight - size) / 2
    );

    const avatar = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    avatar.setAttributeNS("http://www.w3.org/1999/xlink", "href", avatarUrl);

    avatar.classList.add("avatar");
    avatar.setAttribute("id", userId);
    avatar.setAttribute("width", size);
    avatar.setAttribute("height", size);
    avatar.setAttribute("x", x);
    avatar.setAttribute("y", y);
    const svgEl = document.querySelector("svg");
    svgEl.appendChild(avatar);
  }
};

const refreshDeskUi = (deskId) => {
  const el = document.querySelector("#" + deskId);
  const occupantId = occupiedDesks[deskId]?.userId || null;
  const occupantAvatar = occupiedDesks[deskId]?.userAvatar;
  el.classList.toggle("available", occupantId === null);
  if (occupantId) {
    renderAvatar(deskId, occupantId, occupantAvatar);
  }
};

const updateUi = () => {
  // Clean existing avatars
  const avatars = document.querySelectorAll(".avatar");
  for (let one of avatars) {
    one.parentNode.removeChild(one);
  }
  const desks = document.querySelectorAll(".desk");
  for (let desk of desks) {
    refreshDeskUi(desk.getAttribute("id"));
  }
};

const isInitialized = () => {
  return initialized;
};

const refresh = async () => {
  if (!!refreshTimeoutId) {
    window.clearTimeout(refreshTimeoutId);
  }
  if (!isInitialized()) {
    console.log("Initializing from SVG");
    initFromSvg();
  }
  const response = await fetch("/status");
  const json = await response.text();
  console.log("Refreshed");
  occupiedDesks = JSON.parse(json);
  updateUi();
  // TODO: exponential backoff if the user is idle.
  refreshTimeoutId = window.setTimeout(refresh, 5000);
};
