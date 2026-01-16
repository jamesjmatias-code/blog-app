import React from "react";
import { useAppDispatch } from "../hooks";
import { login } from "../features/userSlice";
import signInCSS from "../stylings/signIn.module.css";
import { Link, useNavigate } from "react-router-dom";
import { SupabaseClient } from "@supabase/supabase-js";

interface SignInProps {
    supabase: SupabaseClient;
}

export default function SignIn({ supabase }: SignInProps) {
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    async function logIn() {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            alert(`Login failed: ${error.message}`);
        } else if (data.session) {
            dispatch(login(data.session.user));
            setEmail("");
            setPassword("");
            navigate("/");
        }
    }

    return (
        <div className={signInCSS.container}>
            <div  className={signInCSS.card}>
                <div className={signInCSS.header}>
                    <i className="bi bi-emoji-laughing"></i>
                    <h1>Welcome!</h1>
                    <p>Sign In to your account</p>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        logIn();
                    }}
                >
                <label>
                    Email {" "}
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label>
                    Password {" "}
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <button type="submit">Sign In</button>
                </form>

                <p>
                    Don't have an account yet? {" "}
                    <Link
                        style={{ cursor: "pointer", color: "blue" }}
                        to="/signup"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
