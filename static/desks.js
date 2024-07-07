class Bookable {
  constructor(id) {
    this.id = id;
    this.occupant = null;
  }
}

class Occupant {
  constructor(id, avatar) {
    this.id = id;
    this.avatar = avatar;
  }
}

let refreshTimeoutId = 0;

let bookables = null;

const initFromSvg = () => {
  const svgData = document.querySelector("svg");
  console.log(svgData);
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
  bookables = {};
  for (const desk of desks) {
    desk.classList.add("available");
    bookables[desk.id] = new Bookable(desk.id);
  }
  console.log(bookables);
};

const deskIsAvailable = (deskId) => {
  return bookables[deskId].occupant === null;
};

const bookedDeskForUser = (userId) => {
  for (let bookableId in bookables) {
    if (bookables[bookableId].occupant?.id === userId) {
      return bookables[bookableId];
    }
  }
  return null;
};

const freeDesk = (deskId) => {
  bookables[deskId].occupant = null;
  updateUi();
};

const bookDesk = (deskId) => {
  console.log("Booking desk " + deskId);
  const existing = bookedDeskForUser(loggedInUserEmail);
  if (existing) {
    freeDesk(existing.id);
  }
  bookables[deskId].occupant = new Occupant(
    loggedInUserEmail,
    loggedInUserAvatar
  );
  updateUi();
};

const refreshDeskUi = (deskId) => {
  const el = document.querySelector("#" + deskId);
  console.log(el);
  el.classList.toggle("available", deskIsAvailable(deskId));
};

const updateUi = () => {
  for (let id in bookables) {
    refreshDeskUi(id);
  }
};

const isInitialized = () => {
  return bookables !== null;
};

const refresh = () => {
  if (!!refreshTimeoutId) {
    window.clearTimeout(refreshTimeoutId);
  }
  if (!isInitialized()) {
    initFromSvg();
  }
  // TODO: exponential backoff if the user is idle.
  refreshTimeoutId = window.setTimeout(refresh, 5000);
};
