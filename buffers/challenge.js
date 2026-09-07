// Challenge: Print what it says: 0100 1000 0110 1001 0010 0001

// Since we have 2 bits and buffer only alloc by bytes, so 24 bits / 8 bits = 3 bytes
// When we use the buffer, ensure we alloc correct amount of buffer size that we need
// to hold enough data. If we alloc more, we get extra data. If we alloc less, we discard
// the extra data which results lossing our data

const { Buffer } = require("node:buffer");

// First way
const bufferContainer = Buffer.alloc(3);

bufferContainer[0] = 0x48; // 0100 1000
bufferContainer[1] = 0x69; // 0110 1001
bufferContainer[2] = 0x21; // 0010 0001

console.log(bufferContainer.toString("utf-8"));

// Second way
// With from(), we do not need to specific the buffer size.
// It can calculate automatically for us.
// from() also accepts array type as well
const buff = Buffer.from("486921", "hex");
console.log(buff.toString("utf-8"));
