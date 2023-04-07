export const auth = {

};

export const request = {

};

export const raw = {

  getRouteFiles: async function(routeName) {
    const info = await drives.getRouteInfo(routeName);

    let result = {
    // It's not quite clear to me if there are expected to be as many log files as segments
    // or if these are just for the videos...
      logs: info.segment_numbers.map(function(n) {
        return `${info.url}/rlog${n}.bz2`;
      }),
    };

    return result;
  },

};

export const drives = {

  getRouteInfo: async function(routeName) {
    const route = routeName.split('|')[1];
    const response = await fetch(`/routes/${route}/route.json`);
    return response.json();
  },

  getShareSignature: async function(routeName) {
    return {
      exp: "",
      sig: "",
    };
  },

};

export const video= {

  getQcameraStreamUrl: function(routeName, exp, sig) {
    console.log(`getQcameraStreamUrl ${routeName}`);
    const route = routeName.split('|')[1];
    return `/routes/${route}/qcamera.m3u8`;
  }
};

export default { auth, request, raw, drives, video };
