import { useContext } from "react";
import { flushSync } from "react-dom";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";
export const useAuth = () => {

    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, setLoading } = context;

    // LOGIN // hook layer for api call and state management 
    const handleLogin = async ({ email, password }) => {

        setLoading(true);

        try {

            const data = await login({ email, password });
            flushSync(() => {
                setUser(data?.user ?? null);
            });
            return data;

        } catch (error) {

            console.log("Login Error:", error);
            throw error;

        } finally {

            setLoading(false);
        }
    };

    // REGISTER
    const handleRegister = async ({ username, email, password }) => {

        setLoading(true);

        try {

            const data = await register({ username, email, password });
            flushSync(() => {
                setUser(data?.user ?? null);
            });
            return data;

        } catch (error) {

            console.log("Register Error:", error);
            throw error;

        } finally {

            setLoading(false);

        }
    };

    // LOGOUT
    const handleLogout = async () => {

        setLoading(true);

        try {

            await logout();

            setUser(null);

        } catch (error) {

            console.log("Logout Error:", error);

        } finally {

            setLoading(false);

        }
    };


    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout
    };
};

