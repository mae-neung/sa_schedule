import { BrowserRouter } from "react-router-dom";
import RootRoute from "./routes/RootRoute.tsx";
import Provider from "./components/Provider.tsx";

function App() {
  return (
    <BrowserRouter>
      <Provider>
        <RootRoute />
      </Provider>
    </BrowserRouter>
  );
}

export default App;
