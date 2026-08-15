import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";

const API_URL = import.meta.env.VITE_API_URL;

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_URL}/api/auth/signup`,
                formData
            );
            alert("Signup Successful");
            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Signup Failed");
        }
    };
    return (
        <div className="signupContainer">
            <div className="signupCard">
                <h1>Create Account</h1>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name"  placeholder="Name" onChange={handleChange}/>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                    />
                    <button>SIGN UP</button>
                </form>
                <p>
                    Already have an account?
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;