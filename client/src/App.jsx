import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Friend's Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Sonam's Home Page */}
        <Route path="/home" element={<Home />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;