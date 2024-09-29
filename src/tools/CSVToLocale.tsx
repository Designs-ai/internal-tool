import { useCallback } from "react";
import { BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";

const handleExport = async (text: string, filename: string) => {
  const [_keyHeader, ...langKey] = text.split("\r\n")[0].split(",");
  let fullObj: Record<string, Record<string, string>> = {};
  const textVals = text.split("\r\n").slice(1);

  langKey.forEach((lang, idx) => {
    fullObj[lang] = {};
    textVals.forEach((t) => {
      const [key, ...values] = t
        .replace(/","/g, ";")
        .replace(/,"/g, ";")
        .slice(0, -1)
        .split(";");
      if (key) {
        fullObj[lang][key] = values[idx] || "";
      }
    });
  });

  // console.log({ fullObj });
  const zipFileWriter = new BlobWriter();
  const zipWriter = new ZipWriter(zipFileWriter);
  langKey.forEach(async (lang) => {
    const helloWorldReader = new TextReader(JSON.stringify(fullObj[lang]));
    await zipWriter.add(`${lang}/${filename}.json`, helloWorldReader);
  });
  const blob = await zipWriter.close();

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.zip`;
  link.click();
};

function CSVToLocale() {
  const handleReadfile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files?.length) {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener(
          "load",
          () => {
            handleExport(reader.result as string, file.name.split(".")[0]);
          },
          false
        );
      }
    },
    []
  );

  return (
    <div>
      <div className="prose flex flex-col">
        <h1>Convert translation CSV file to locale JSON</h1>

        <ol>
          <li className="text-lg">Select csv file</li>
          <li className="text-lg">Click the file to export</li>
        </ol>
      </div>

      <input type="file" accept=".csv" onChange={handleReadfile} />
    </div>
  );
}

export default CSVToLocale;
