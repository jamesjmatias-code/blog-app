import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, selectUser } from "./features/userSlice";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Home from "./components/Home";
import { supabase } from "./features/supabase";
import { Routes, Route, Navigate } from "react-router-dom";
import CreateBlog from "./components/CreateBlog";
import EditBlog from "./components/EditBlog";
import PostView from "./components/PostView";

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        dispatch(login(data.session.user));
      }
    });
  }, [dispatch]);

return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <SignIn supabase={supabase} />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" /> : <SignUp supabase={supabase} />}
      />
      <Route
        path="/create"
        element={user ? <CreateBlog /> : <Navigate to="/login" />}
      />
      <Route 
        path="/edit/:id"
        element={user ? <EditBlog /> : <Navigate to="/login" />}
      />
      <Route 
        path="/post/:id"
        element={user ? <PostView /> : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
