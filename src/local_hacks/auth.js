function isAuthenticated() {
    return true; // It's a miracle!
}

async function init() {
  return "";
}

export const storage = {

  logout: function() {
    console.log("storage.logout()");
  },

};

export const config = {
};

export default { init, isAuthenticated, storage, config };
