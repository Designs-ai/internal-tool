import { FunctionComponent, PropsWithChildren, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import LocaleToCSV from "./tools/LocaleToCSV.tsx";
import { BreadcrumbLayout } from "./shared/BreadcrumbLayout.tsx";

const CommonLayout: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <>
    <BreadcrumbLayout />
    {children}
  </>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/locale-to-csv"
          element={
            <CommonLayout>
              <LocaleToCSV />
            </CommonLayout>
          }
        />
        <Route
          path="/csv-to-locale"
          element={
            <CommonLayout>
              <LocaleToCSV />
            </CommonLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
