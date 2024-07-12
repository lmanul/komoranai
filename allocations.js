const allocations = {};

const allocate = (deskId, userId, userAvatar) => {
  // Even if the client tries to trick us, or is out of sync, let's make sure
  // we only allow one desk per person.
  for (let occupiedDeskId in allocations) {
    if (allocations[occupiedDeskId] && allocations[occupiedDeskId].userId === userId) {
      deallocate(occupiedDeskId);
    }
  }
  allocations[deskId] = { userId, userAvatar };
};

const status = () => {
  return allocations;
};

const deallocate = (deskId) => {
  allocations[deskId] = undefined;
};

module.exports = {
  allocate,
  status,
  deallocate,
};
