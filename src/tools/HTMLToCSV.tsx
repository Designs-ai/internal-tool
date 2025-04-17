import { useCallback, useState } from "react";
import writeAndDownloadCSV from "../utils/writeAndDownloadCSV";

// Define the tags you're interested in
const tags = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "li",
  "a",
  "strong",
  "em",
  "blockquote",
];

async function extractStructuredTextFromURL(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const results: Partial<Record<string, (string | undefined)[]>> = {};

  for (const tag of tags) {
    const elements = doc.querySelectorAll(tag);
    results[tag] = Array.from(elements)
      .map((el) => el.textContent?.trim())
      .filter(Boolean);
  }

  let data = "";
  Object.entries(results).forEach(([k, v]) => {
    if (v && v.length > 0) {
      v.forEach((v2) => {
        data += `${k},"${v2}"\r\n`;
      });
    }
  });

  writeAndDownloadCSV({
    filename: `${new URL(url).pathname.replace(/\//g, "_")}`,
    data,
  });
}

function HTMLToCSV() {
  const [loading, setLoading] = useState(false);
  const handleReadURL = useCallback(
    async (e: React.ChangeEvent<HTMLFormElement>) => {
      setLoading(true);
      e.preventDefault();
      const theUrl = e.target.getElementsByTagName("input")[0].value;
      try {
        await extractStructuredTextFromURL(theUrl).catch(async (error) => {
          console.error("Error extracting structured text:", error);
          await extractStructuredTextFromURL(
            "https://api.allorigins.win/get?url=" + encodeURIComponent(theUrl)
          );
        });
      } catch {
        alert("omaigaddd... got error~ \ncheck console tab bruh");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <div>
      <div className="prose flex flex-col">
        <h1>Extract website content into CSV</h1>
        <ol>
          <li className="text-lg">Put in the website page URL</li>
          <li className="text-lg">Click the file to export</li>
        </ol>

        <form
          className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box"
          onSubmit={handleReadURL}
        >
          <label className="label">Website URL:</label>
          <input
            placeholder="https://designs.ai/colors/image"
            className="input w-4/6 rounded-lg"
            type="text"
            required
            disabled={loading}
          />
          {loading && <span className="loading loading-dots loading-xl"></span>}
        </form>
      </div>
    </div>
  );
}

export default HTMLToCSV;
