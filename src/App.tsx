import { Link } from "react-router-dom";
import { appList } from "./utils/config";

function App() {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen flex-col">
        <img src="typingcat.gif" className="w-1/12" />
        <h1 className="text-4xl font-bold">Welcome to Internal Tool</h1>
        <div className="flex flex-wrap justify-center align-middle gap-5 max-w-screen-md m-5">
          {appList.map(({ icon, name, path }) => (
            <Link to={path} key={path} className="avatar flex flex-col">
              <div className="w-24 rounded-full">
                <img src={icon} />
              </div>
              <p>{name}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
