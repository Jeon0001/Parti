import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import MyPartis from "./MyPartis"
import CreateParti from "./create/CreateParti";
import FindParti from "./find/FindParti";
import CreateSelectLanguage from "./create/SelectLanguage"
import CreateSelectTags from "./create/SelectTags"
import CreateSelectTime from "./create/SelectTime"
import CreateFinalize from "./create/Finalize"
import Chat from "./chat/Chat"
import AllPartis from "./find/AllPartis";




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createparti" element={<CreateParti />} />
        <Route path="/findpartis" element={<FindParti />} />
        <Route path="/create/selectlanguage" element={<CreateSelectLanguage />} />
        <Route path="/create/selecttags" element={<CreateSelectTags />} />
        <Route path="/create/selecttime" element={<CreateSelectTime />} />
        <Route path="/create/finalize" element={<CreateFinalize />} />
        <Route path="/allpartis" element={<AllPartis />} />
        <Route path="/mypartis" element={<MyPartis />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
