const EventEmitter = require("./events");

// ==========================================
// UNIFIED TEST SUITE FOR EVENTEMITTER
// ==========================================

const emitter = new EventEmitter();
let testPassed = true;

// --- Test 1: Subscribing and Emitting a Basic Event ---
let test1Called = false;
emitter.on("greet", () => {
  test1Called = true;
});

emitter.emit("greet");

if (test1Called) {
  console.log("✅ Test 1 Passed: Basic on() and emit() work.");
} else {
  console.error("❌ Test 1 Failed: Listener was not called.");
  testPassed = false;
}

// --- Test 2: Passing Arguments to Listeners ---
let receivedData = null;
emitter.on("login", (username, role) => {
  receivedData = { username, role };
});

emitter.emit("login", "Alice", "Admin");

if (
  receivedData &&
  receivedData.username === "Alice" &&
  receivedData.role === "Admin"
) {
  console.log("✅ Test 2 Passed: Arguments successfully passed to listeners.");
} else {
  console.error("❌ Test 2 Failed: Arguments were missing or incorrect.");
  testPassed = false;
}

// --- Test 3: Multiple Listeners for One Event ---
let count = 0;
emitter.on("update", () => (count += 1));
emitter.on("update", () => (count += 10));

emitter.emit("update");

if (count === 11) {
  console.log("✅ Test 3 Passed: Multiple listeners fired in sequence.");
} else {
  console.error(`❌ Test 3 Failed: Expected count to be 11, got ${count}`);
  testPassed = false;
}

// --- Test 4: Removing a Listener with off() ---
let test4Count = 0;
const callbackToRemove = () => {
  test4Count++;
};

emitter.on("click", callbackToRemove);
emitter.emit("click"); // Fires once, count becomes 1

emitter.off("click", callbackToRemove);
emitter.emit("click"); // Should NOT fire, count stays 1

if (test4Count === 1) {
  console.log("✅ Test 4 Passed: off() successfully removes a listener.");
} else {
  console.error(
    `❌ Test 4 Failed: Expected count to stay 1, but it was ${test4Count}`,
  );
  testPassed = false;
}

// --- Test 5: Emitting an Event with No Listeners ---
try {
  // This should not crash or throw an error even though 'ghost' has no listeners
  emitter.emit("ghost", "boo");
  console.log(
    "✅ Test 5 Passed: Emitting an unregistered event handles gracefully.",
  );
} catch (error) {
  console.error(
    "❌ Test 5 Failed: Firing an empty event caused a crash:",
    error.message,
  );
  testPassed = false;
}

// --- Test 6: basic once() functionality ---
let onceCount = 0;
emitter.once("single", () => onceCount++);

emitter.emit("single"); // Fires, count = 1
emitter.emit("single"); // Should NOT fire, count stays 1

if (onceCount === 1) {
  console.log("✅ Test 6 Passed: once() fires exactly one time.");
} else {
  console.error(`❌ Test 6 Failed: Expected count to be 1, got ${onceCount}`);
  testPassed = false;
}

// --- Test 7: off() can remove a once() listener before it fires ---
let test7Fired = false;
const callbackToCancel = () => {
  test7Fired = true;
};

emitter.once("abort", callbackToCancel);
emitter.off("abort", callbackToCancel); // Canceling before emitting
emitter.emit("abort");

if (!test7Fired) {
  console.log(
    "✅ Test 7 Passed: off() successfully untracks a once() listener.",
  );
} else {
  console.error(
    "❌ Test 7 Failed: once() listener fired even after being removed via off().",
  );
  testPassed = false;
}

// --- Test 8: Aliases (addListener and removeListener) ---
let aliasFired = false;
if (
  typeof emitter.addListener === "function" &&
  typeof emitter.removeListener === "function"
) {
  const cb = () => (aliasFired = true);
  emitter.addListener("aliasTest", cb);
  emitter.emit("aliasTest");
  emitter.removeListener("aliasTest", cb);
  emitter.emit("aliasTest"); // Should not fire a second time

  if (aliasFired) {
    console.log(
      "✅ Test 8 Passed: addListener and removeListener aliases work.",
    );
  } else {
    console.error("❌ Test 8 Failed: Aliases did not route logic properly.");
    testPassed = false;
  }
} else {
  console.error(
    "❌ Test 8 Failed: addListener or removeListener are not implemented.",
  );
  testPassed = false;
}

// --- Test 9: prependListener controls execution order ---
let orderTrack = [];
emitter.on("order", () => orderTrack.push("second"));
if (typeof emitter.prependListener === "function") {
  emitter.prependListener("order", () => orderTrack.push("first"));
  emitter.emit("order");

  if (orderTrack[0] === "first" && orderTrack[1] === "second") {
    console.log(
      "✅ Test 9 Passed: prependListener runs before normal listeners.",
    );
  } else {
    console.error(
      `❌ Test 9 Failed: Expected order ['first', 'second'], got:`,
      orderTrack,
    );
    testPassed = false;
  }
} else {
  console.error("❌ Test 9 Failed: prependListener is not implemented.");
  testPassed = false;
}

// --- Test 10: Inspection (listenerCount, eventNames, listeners) ---
if (
  typeof emitter.listenerCount === "function" &&
  typeof emitter.eventNames === "function" &&
  typeof emitter.listeners === "function"
) {
  emitter.on("inspectA", () => {});
  emitter.on("inspectA", () => {});
  emitter.on("inspectB", () => {});

  const countA = emitter.listenerCount("inspectA");
  const names = emitter.eventNames();
  const listA = emitter.listeners("inspectA");

  const correctCount = countA === 2;
  const correctNames = names.includes("inspectA") && names.includes("inspectB");
  const correctList = Array.isArray(listA) && listA.length === 2;

  if (correctCount && correctNames && correctList) {
    console.log(
      "✅ Test 10 Passed: Inspection methods accurately expose state.",
    );
  } else {
    console.error(
      "❌ Test 10 Failed: Inspection methods returned incorrect data.",
    );
    testPassed = false;
  }
} else {
  console.error(
    "❌ Test 10 Failed: One or more inspection methods are missing.",
  );
  testPassed = false;
}

// --- Test 11: Bulk cleanup with removeAllListeners ---
if (typeof emitter.removeAllListeners === "function") {
  let fireCount = 0;
  emitter.on("clearMe", () => fireCount++);
  emitter.on("keepMeTemporarily", () => fireCount++);

  // 1. Remove all for a specific event
  emitter.removeAllListeners("clearMe");
  emitter.emit("clearMe"); // Should do nothing

  // 2. Clear every single event remaining
  emitter.removeAllListeners();
  emitter.emit("keepMeTemporarily"); // Should do nothing

  if (fireCount === 0) {
    console.log(
      "✅ Test 11 Passed: removeAllListeners successfully clears targets.",
    );
  } else {
    console.error(
      `❌ Test 11 Failed: Listeners still fired after clearing (fireCount: ${fireCount}).`,
    );
    testPassed = false;
  }
} else {
  console.error("❌ Test 11 Failed: removeAllListeners is not implemented.");
  testPassed = false;
}

// ==========================================
// FINAL SUMMARY
// ==========================================
console.log("\n------------------------------------");
if (testPassed) {
  console.log("🏆 GRAND SLAM! All 11 tests passed successfully.");
} else {
  console.log("⚠️ Framework incomplete. Some tests are still failing.");
}
