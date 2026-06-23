import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route, Routes } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import ToastContainer from "./components/ToastContainer";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chats" element={<Chatpage />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
