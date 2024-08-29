onmessage = async function ({ data }) {
  const file = await data.file.fileHandle.getFile();
  const fileText = await file.text();
  postMessage({
    fileText: JSON.parse(fileText),
    name: file.name,
    filepath: data.file.filepath,
    id: data.id,
  });
};
