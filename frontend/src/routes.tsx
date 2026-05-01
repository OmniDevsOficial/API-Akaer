import { Route, BrowserRouter, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Home from './pages/Home/Home';
import Editar from './pages/Editar/Editar'

const routes = [
    {element: <LoginPage />, path: "/"},
    {element: <Home />, path: "/home"},
    {element: <Editar />, path: "/normas/editar"}
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