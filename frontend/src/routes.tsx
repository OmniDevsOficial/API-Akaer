import { Route, BrowserRouter, Routes } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import Home from './pages/Home/Home';
import Solicitar from './pages/Solicitar/solicitar';
import Visualizar from "./pages/Normas/Visualizar";
import Editar from './pages/Editar/Editar'

const routes = [
    {element: <LoginPage />, path: "/"},
    {element: <Home />, path: "/home"},
    {element: <Solicitar />, path: "/solicitar"},
    {element: <Visualizar />, path: "/normas/ver/:codigo"},
    {element: <Editar />, path: "/normas/editar/:codigo"},
    {element: <Editar />, path: "/normas/usuario/:id"} // trocar o elemento por usuário quando a página estiver feita
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