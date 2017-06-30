window = self;

require('core-js/fn/object/values');
import NumpyLoader from '../utils/loadnpy';
import DBC from '../models/can/dbc';
import DbcUtils from '../utils/dbc';
import * as CanApi from '../api/can';

const Int64LE = require('int64-buffer').Int64LE

function createMessageSpec(dbc, address, id, bus) {
    const frame = dbc.messages.get(address);
    const size = frame ? frame.size : 8;

    return {address: address,
            id: id,
            bus: bus,
            entries: [],
            frame: dbc.messages.get(address),
            byteStateChangeCounts: Array(size).fill(0)}
}

function findMaxByteStateChangeCount(messages) {
  return Object.values(messages).map((m) => m.byteStateChangeCounts)
                                .reduce((counts, countArr) => counts.concat(countArr), []) // flatten arrays
                                .reduce((count1, count2) => count1 > count2 ? count1 : count2, 0); // find max
}

async function loadCanPart(dbc, base, num, canStartTime, prevMsgEntries) {
    var messages = {};
    const {times,
           sources,
           addresses,
           datas} = await CanApi.fetchCanPart(base, num);


    for (var i = 0; i < times.length; i++) {
       var t = times[i];
       var src = Int64LE(sources, i*8).toString(10);
       var address = Int64LE(addresses, i*8);
       var addressHexStr = address.toString(16);
       var id = src + ":" + addressHexStr;

       var addressNum = address.toNumber();
       var data = datas.slice(i*8, (i+1)*8);
       if (messages[id] === undefined) messages[id] = createMessageSpec(dbc, address.toNumber(), id, src);

       const prevMsgEntry = messages[id].entries.length > 0 ?
                            messages[id].entries[messages[id].entries.length - 1]
                            :
                            (prevMsgEntries[id] || null);

       const {msgEntry,
              byteStateChangeCounts} = DbcUtils.parseMessage(dbc,
                                                             t,
                                                             address.toNumber(),
                                                             data,
                                                             canStartTime,
                                                             prevMsgEntry);
       messages[id].byteStateChangeCounts = byteStateChangeCounts.map((count, idx) =>
        messages[id].byteStateChangeCounts[idx] + count
       );

       messages[id].entries.push(msgEntry);
  }

  const maxByteStateChangeCount = findMaxByteStateChangeCount(messages);
  self.postMessage({newMessages: messages,
                    maxByteStateChangeCount});
  self.close();
}

self.onmessage = function(e) {
    const {dbcText, base, num, canStartTime, prevMsgEntries} = e.data;

    const dbc = new DBC(dbcText);
    loadCanPart(dbc, base, num, canStartTime, prevMsgEntries);
}
