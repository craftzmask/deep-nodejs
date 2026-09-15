const fs = require("fs/promises");

(async () => {
  const watcher = await fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      const commandFileHandler = await fs.open("./command.txt", "r");

      const size = (await commandFileHandler.stat()).size;
      const buff = new Buffer.alloc(size);

      const offset = 0;
      const length = buff.length;
      const position = 0;

      await commandFileHandler.read(buff, offset, length, position);

      const content = buff.toString("utf-8");
      console.log(content);
    }
  }
})();
