const allocations = {};

const allocate = (deskId, userId, userAvatar) => {
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
