import React from "react";
import { useAppDispatch } from "../hooks";
import { login } from "../features/userSlice";
import signUpCSS from "../stylings/signUp.module.css";
import { Link, useNavigate } from "react-router-dom";
import { SupabaseClient } from "@supabase/supabase-js";


interface SignUpProps {
    supabase: SupabaseClient;
}

export default function SignUp({ supabase }: SignUpProps) {
    const [name, setName] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    async function signUp() {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
    
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
            data: { name },
            },
        });
    
        if (error) {
            alert(`Sign-up failed: ${error.message}`);
        } else if (data.session) {
            dispatch(login(data.session.user));
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setName("");
            navigate("/")
        }
    }

    return (
        <div className={signUpCSS.container}>
            <div className={signUpCSS.card}>
                <div className={signUpCSS.header}>
                    <i className="bi bi-person-plus"></i>
                    <h1>Create Account</h1>
                    <p>Sign Up to start blogging</p>
                </div>
                <form
                    onSubmit={(e) => {
                    e.preventDefault();
                    signUp();
                    }}
                >
                <label>
                    Name {" "}
                    <input
                        type="name"
                        placeholder="Juan Cruz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Email {" "}
                    <input
                        type="email"
                        placeholder="juan@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Password {" "}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Confirm Password: {" "}
                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>

                <button type="submit">Sign Up</button>
                </form>
                <p>
                    Already have an account? {" "}
                    <Link
                        style={{ cursor: "pointer", color: "blue" }}
                        to="/login"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
