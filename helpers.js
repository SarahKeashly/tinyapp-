

const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return userId;

    }
  }
  return undefined;
}


module.exports = findUserByEmail