const { Buffer } = require("node:buffer");

// This is slow because it needs to sanitize the buffer
// by default filling 0 all elements
Buffer.alloc(3);

// This is faster because it does not sanitize the buffer
// However, the buffer can contain sensitive data. It is
// recommended not to use allocUnsafe without sanitizing
Buffer.allocUnsafe(3);

// Both these methods use allocUnsafe() underhood.
// In this case, both are ok because they only alloc
// correct amount of buffer size to hold enough data
// and they fill data immediately after. No sensitive data left alone
Buffer.from();
Buffer.concat();

// The fastest way to alloc buffer if and only if
// we use allocUnsafe() and the size must be smaller Buffer.poolSize >>> 1
// By default the Buffer.poolSize is 8Kb. If we alloc less 4Kb, we can make
// use of the pre-allocated buffer by Node. Therefore, it is the fastest way possible

// The method is similar to allocUnsafe, however, it never uses the pre-allocated buffer
// even though if we allocate with the size smaller Buffer.poolSize >>> 1
Buffer.allocUnsafeSlow();
