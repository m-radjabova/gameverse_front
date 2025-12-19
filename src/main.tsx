import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import CreateContextPro from "./hooks/CreateContextPro.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* <CreateContextPro> */}
          <App />
          <ToastContainer />
        {/* </CreateContextPro> */}
      </BrowserRouter>
    </QueryClientProvider>
  </>
);
