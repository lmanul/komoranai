let refreshTimeoutId = 0;
let initialized = false;
let occupiedDesks = null;
let lastActiveTime = Date.now();

const refreshInterval = () => {
  const idleTime = Date.now() - lastActiveTime;
  if (idleTime < 10000) {
    return 2000;
  }
  if (idleTime < 20000) {
    return 5000;
  }
  if (idleTime < 60000) {
    return 10000;
  }
  return 30000;
};

const initFromSvg = () => {
  const svgData = document.querySelector("svg");
  if (!svgData) {
    // Try again soon
    setTimeout(refresh, 0);
    return;
  }
  document.body.addEventListener("mousemove", () => {
    lastActiveTime = Date.now();
  });
  document.body.addEventListener("click", (event) => {
    lastActiveTime = Date.now();
    const target = event.target;
    if (!target.classList.contains("desk")) {
      return;
    }
    if (deskIsAvailable(target.id)) {
      bookDesk(target.id);
    } else if (target.id === bookedDeskIdForUser(loggedInUserEmail)) {
      freeDesk(target.id);
    }
  });
  const desks = document.querySelectorAll(".desk");
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

    // const avatarContainer = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "rect"
    // );
    const avatar = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    avatar.setAttributeNS("http://www.w3.org/1999/xlink", "href", avatarUrl);

    avatar.classList.add("avatar");
    // avatarContainer.classList.add("avatar-container");
    avatar.setAttribute("id", userId);
    avatar.setAttribute("width", size);
    avatar.setAttribute("height", size);
    avatar.setAttribute("x", x);
    avatar.setAttribute("y", y);
    // avatarContainer.setAttribute("width", size);
    // avatarContainer.setAttribute("height", size);
    // avatarContainer.setAttribute("x", x);
    // avatarContainer.setAttribute("y", y);
    // avatarContainer.setAttribute("fill", "#00c");
    // avatarContainer.setAttribute("opacity", "0.01");
    const title = document.createElement("title");
    title.textContent = userId;
    // avatarContainer.appendChild(title);
    el.parentNode.appendChild(avatar);
    // svgEl.appendChild(avatarContainer);
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
  // const avatars = document.querySelectorAll(".avatar-container");
  for (let one of avatars) {
    one.parentNode.removeChild(one);
  }
  const desks = document.querySelectorAll(".desk");
  for (let desk of desks) {
    refreshDeskUi(desk.getAttribute("id"));
  }

  const totalDeskCount = desks.length;
  const occupiedDeskCount = Object.keys(occupiedDesks).length;

  document.getElementById("available-count").textContent = new String(
    totalDeskCount - occupiedDeskCount
  );
  document.getElementById("occupied-count").textContent = new String(
    occupiedDeskCount
  );
};

const isInitialized = () => {
  return initialized;
};

const refresh = async () => {
  if (!!refreshTimeoutId) {
    window.clearTimeout(refreshTimeoutId);
  }
  if (!isInitialized()) {
    initFromSvg();
  }
  const response = await fetch("/status");
  const json = await response.text();
  occupiedDesks = JSON.parse(json);
  updateUi();
  refreshTimeoutId = window.setTimeout(refresh, refreshInterval());
};
