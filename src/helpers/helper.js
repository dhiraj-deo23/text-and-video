const users = [];

const addUser = ({ id, userId }) => {
  const user = { id, userId };
  users.push(user);
  return user;
};

const removeUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
};

const toString = (buffer) => {
  return buffer.toString("base64");
};

module.exports = {
  toString,
  addUser,
  removeUser,
};
