import { Route, BrowserRouter, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Home from './pages/Home/Home';
import Visualizar from "./pages/Normas/Visualizar";

const routes = [
    {element: <LoginPage />, path: "/"},
    {element: <Home />, path: "/home"},
    {element: <Visualizar />, path: "/normas/ver/:codigo"}
]

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                {routes.map((route, index) => (
                    <Route key={index} element={route.element} path={route.path} />
                ))}
            </Routes>
        </BrowserRouter>
    )
}

export default Router;