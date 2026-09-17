const fs = require("fs/promises");

const CREATE_FILE = "create a file";
const DELETE_FILE = "delete the file";
const RENAME_FILE = "rename the file";

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
  };

  const renameFile = async (oldPath, newPath) => {
    console.log("Current directory:", process.cwd());
    console.log(
      "Source exists:",
      await fs.stat(oldPath).then(
        () => true,
        () => false,
      ),
    );
    console.log(`${oldPath} === ${newPath}`);
    try {
      await fs.rename(oldPath, newPath);
      console.log("Renamed the file succesfully");
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(
          "No file at this path to rename or the destination doesn't exist",
        );
      } else {
        console.log(
          `There is ab error occured while removing the file: ${error}`,
        );
      }
    }
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
    } else if (content.includes(RENAME_FILE)) {
      const idx = content.indexOf(" to ");
      const oldPath = content.substring(RENAME_FILE.length + 1, idx);
      const newPath = content.substring(idx + 4);
      renameFile(oldPath, newPath);
    }
  });

  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
