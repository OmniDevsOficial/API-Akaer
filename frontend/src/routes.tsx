import { Route, BrowserRouter, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Home from './pages/Home/Home';
import Solicitar from './pages/Solicitar/solicitar';
import Visualizar from "./pages/Normas/Visualizar";
import Editar from './pages/Editar/Editar'
import Usuario from './pages/usuario/usuario'

const routes = [
    {element: <LoginPage />, path: "/"},
    {element: <Home />, path: "/home"},
    {element: <Solicitar />, path: "/solicitar"},
    {element: <Visualizar />, path: "/normas/ver/:codigo"},
    {element: <Editar />, path: "/normas/editar/:codigo"},
    { element: <Usuario />, path: "/usuario" }
];
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