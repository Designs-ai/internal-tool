import { useEffect, useRef, useState } from "react";
import { group, isEmpty, pick } from "moderndash";

declare global {
  interface Window {
    showDirectoryPicker: any;
    showOpenFilePicker: any;
  }
}

type FolderContentType = (FileSystemDirectoryHandle | FileSystemFileHandle) & {
  values: any;
  path?: string;
};

type Filehandle = FileSystemFileHandle & {
  values: any;
  path?: string;
};
type FileMeta = {
  fileHandle: Filehandle;
  filepath: string;
};

const RenderDirectory = ({ data }: { data: any }) => {
  if (Object.keys(data).length < 1) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(data).map(([p, c]: [string, any]) => (
        <div key={p}>
          <div>
            <p>{p}</p>
            {c && <RenderDirectory data={c} />}
          </div>
        </div>
      ))}
    </div>
  );
};

function TranslationFileExport() {
  // const [fileStructure, setFileStructure] = useState<any>();
  const [count, setCount] = useState<number>(0);
  const [csvData, setCsvData] = useState<Record<string, any>>({});
  const [allFileNames, setAllFileNames] = useState(new Set<string>());
  const [allFileHandles, setAllFileHandles] = useState<FileMeta[]>([]);
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function getFileData(file: FileMeta, id: number) {
    if (window.Worker) {
      const worker = new Worker("workers/getDataWorker.js");
      worker.postMessage({ file, id });
      setCount((p) => p + 1);

      worker.onmessage = function ({
        data,
      }: {
        data: {
          fileText: object;
          filepath: string;
          name: string;
          id: number;
        };
      }) {
        setCount((p) => p - 1);
        const [langCode] = data?.filepath.split("/").slice(-2, -1) || ["test"];
        setCsvData((p = {}) => {
          p[data.name.split(".")[0]] = p[data.name.split(".")[0]] ?? {};

          Object.entries(data.fileText).map(([key, val]) => {
            p[data.name.split(".")[0]][key] =
              p[data.name.split(".")[0]][key] ?? {};

            p[data.name.split(".")[0]][key][langCode] =
              p[data.name.split(".")[0]][key][langCode] ?? {};

            p[data.name.split(".")[0]][key][langCode] = val;
          });
          return { ...p };
        });
      };
    } else {
      console.log("Your browser doesn't support web workers.");
    }
  }

  async function getFolderStructure(
    folderContent: FolderContentType,
    level?: string
  ) {
    if (folderContent.kind === "directory") {
      for await (const value of folderContent.values()) {
        getFolderStructure(value, `${level ?? ""}${folderContent.name}/`);
      }
    } else if (folderContent.kind === "file") {
      setAllFileNames((p) => {
        p.add(folderContent.name);
        return p;
      });
      const file = {
        fileHandle: folderContent,
        filepath: `/${level}${folderContent.name}`,
      };
      setAllFileHandles((p) => [...p, file]);

      // const parents = file.filepath.split(".")[0].split("/").slice(1);
      // const currFs = parents
      //   .reverse()
      //   .reduce((res, key) => ({ [key]: res }), file.fileHandle as any);
      // setFileStructure((p: any) => merge(p, currFs));
    }
  }

  async function test() {
    try {
      modalRef.current?.showModal();
      const folderContent = await window.showDirectoryPicker();
      getFolderStructure(folderContent);
    } finally {
      modalRef.current?.close();
    }
  }

  // const structuredFiles = useMemo(() => {
  //   if (files.length > 14) {
  //     const s: Record<string, any> = [];
  //     files.forEach(({ fileHandle, filepath }) => {
  //       const parents = filepath.split("/").slice(1, -1);
  //       const currFs = parents
  //         .reverse()
  //         .reduce((res, key) => ({ [key]: res }), fileHandle as any);

  //       s.push(currFs);
  //       // console.log({ currFs });
  //     });
  //     var resultObject = s.reduce(function (result: any, currentObject: any) {
  //       for (var key in currentObject) {
  //         if (currentObject.hasOwnProperty(key)) {
  //           result[key] = currentObject[key];
  //         }
  //       }
  //       return result;
  //     }, {});
  //     console.log({ resultObject });
  //     return resultObject;
  //   } else return null;
  // }, [files]);

  function getFileTranslation(filename: string) {
    const obj = pick(
      group(allFileHandles, ({ fileHandle }) => fileHandle.name),
      [filename]
    );
    obj[filename].forEach((f, id) => {
      getFileData(f, id);
    });
  }

  useEffect(() => {
    if (!isEmpty(csvData) && count === 0) {
      const header = "key,en,cn,cz,de,es,fr,id,it,jp,kr,pl,pt,ru,tr,tw\r\n";
      let data = "";

      // TODO: Need refactor -> this is hardcoded
      const [[filename, val]] = Object.entries(csvData);
      Object.entries(val).forEach(([k, v]: [string, any]) => {
        data += `${k},"${v["en"]}","${v["cn"]}","${v["cz"]}","${v["de"]}","${v["es"]}","${v["fr"]}","${v["id"]}","${v["it"]}","${v["jp"]}","${v["kr"]}","${v["pl"]}","${v["pt"]}","${v["ru"]}","${v["tr"]}","${v["tw"]}"\r\n`;
      });

      const blob = new Blob([header + data], {
        type: "text/csv;charset=utf-8",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();

      // console.log({ data });
      setCsvData({});
    }
  }, [csvData, count]);

  return (
    <div>
      <div className="prose flex flex-col">
        <h1>Export translation file</h1>

        <ol>
          <li className="text-lg">Click Open folder</li>
          <li className="text-lg">
            Select the locale root directory that contains all the languages
            file
          </li>
          <li className="text-lg">Click the file to export</li>
        </ol>

        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            test();
          }}
        >
          <button
            className="btn btn-primary"
            type="submit"
            disabled={allFileNames.size > 0}
          >
            Open Folder
          </button>
        </form>

        <dialog
          onCancel={(e) => {
            e.preventDefault();
          }}
          ref={modalRef}
          id="my_modal_1"
          className="modal"
        >
          <span className="loading loading-dots loading-lg" />
        </dialog>
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-1">
        {allFileNames.size > 0 &&
          Array.from(allFileNames).map((d) => (
            <button
              onClick={(e) => {
                e.preventDefault();
                getFileTranslation(d);
              }}
              className="btn btn-neutral"
              key={d}
            >
              {d}
            </button>
          ))}
      </div>
    </div>
  );
}

export default TranslationFileExport;
