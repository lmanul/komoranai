class Bookable {
  constructor(id) {
    this.id = id;
    this.occupant = "";
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
  return bookables[deskId].occupant === "";
};

const bookDesk = (deskId) => {
  console.log("Booking desk " + deskId);
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
