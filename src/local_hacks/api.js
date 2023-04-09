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
        return `${info.url}/rlog${n}.gz`;
      }),
    };

    return result;
  },

};

export const drives = {

  getRouteInfo: async function(routeName) {
    const [dongleId, route] = routeName.split('|');
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
    const [dongleId, route] = routeName.split('|');
    console.log(`getQcameraStreamUrl ${route}`);
    return `/routes/${route}/video.m3u8`;
  }
};

export default { auth, request, raw, drives, video };
