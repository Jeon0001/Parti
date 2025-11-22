import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import MyPartis from "./MyPartis"
import CreateParti from "./create/CreateParti";
import SelectLanguage from "./create/SelectLanguage"
import SelectTags from "./create/SelectTags"
import SelectTime from "./create/SelectTime"
import Finalize from "./create/Finalize"
import Chat from "./chat/Chat"



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createparti" element={<CreateParti />} />
        <Route path="/selectlanguage" element={<SelectLanguage />} />
        <Route path="/selecttags" element={<SelectTags />} />
        <Route path="/selecttime" element={<SelectTime />} />
        <Route path="/finalize" element={<Finalize />} />
        <Route path="/mypartis" element={<MyPartis />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
