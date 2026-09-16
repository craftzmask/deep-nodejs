const fs = require("fs/promises");

const CREATE_FILE = "create a file";
const DELETE_FILE = "delete the file";

(async () => {
  const createFile = async (path) => {
    try {
      const existingFileHandle = await fs.open(path, "r");
      existingFileHandle.close();
      console.log("File already existed:", path);
    } catch (error) {
      const newFileHandle = await fs.open(path, "w");
      newFileHandle.close();
      console.log("A new file created:", path);
    }
  };

  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log("Deleted the file succesfully");
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`The file does not exist to remove: ${path}`);
      } else {
        console.log(
          `There is ab error occured while removing the file: ${error}`,
        );
      }
    }

    console.log(`Delete file: ${path}`);
  };

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = new Buffer.alloc(size);

    const offset = 0;
    const length = buff.length;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);

    const content = buff.toString("utf-8");

    // create a file <path>
    if (content.includes(CREATE_FILE)) {
      const filePath = content.substring(CREATE_FILE.length + 1);
      createFile(filePath);
    } else if (content.includes(DELETE_FILE)) {
      const filePath = content.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }
  });

  const watcher = fs.watch("./command.txt");

  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
