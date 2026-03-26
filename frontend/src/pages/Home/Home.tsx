import { useNavigate } from 'react-router-dom';

export default function Home() {

    const navigate = useNavigate();

    const handleLogout = async () => {
        localStorage.removeItem("token");
        navigate('/');
    };

    return (
        <>
            <h1>Home</h1>
            <br />
            <button onClick={() => handleLogout()}>Logout</button>
        </>
    )
}