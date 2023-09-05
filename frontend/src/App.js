import "./App.css";
import { Routes, Route } from "react-router-dom";

import HomeIndex from "./components/HomeIndex";
import ChatPage from "./components/ChatPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomeIndex />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
