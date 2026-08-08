import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
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

            const response = await axios.post(
                "http://localhost:8080/api/auth/login",
                formData
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            alert("Login Successful");

            navigate("/");

        } catch (error) {

            alert(error.response?.data?.message || "Login Failed");
        }

    };

    return (

        <div className="loginContainer">

            <div className="loginCard">
                <h1>SigmaGPT</h1>
                <p>Welcome Back</p>
                <form onSubmit={handleSubmit}>
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
                    <button className="btn">LOGIN</button>
                </form>
                <p>

                    Don't have an account?

                    <Link to="/signup">
                        Sign Up
                    </Link>

                </p>

            </div>

        </div>

    );
}

export default Login;