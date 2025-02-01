import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LandingPage from './LandingPage';
import MiniDrawer from './components/SideBar';
import ProcessPage from './ProcessPage';

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage/>} />
          <Route path='/process' element={<ProcessPage/>} />
          <Route path='/main/*' element={<MiniDrawer />} />
        </Routes>
      </Router>
    </>
  )
}

export default App