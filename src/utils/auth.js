import axios from "axios";

export const logout = async () => {
    try {
const token = localStorage.getItem("token");
        if (token) {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }
    } catch (error) {
        console.error("Logout failed", error);
    } finally {
        // Clear all local storage items related to auth
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        
        // Dispatch auth-change event
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth-change"));
        }

        // Redirect to login
        window.location.href = "/login";
    }
};
export const getUserDetails = () => {
    if (typeof window === "undefined") return null;
    
    // 1. Try getting directly from localStorage
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedRole = localStorage.getItem("userRole");

    if (storedName) {
        return { name: storedName, email: storedEmail, role: storedRole };
    }

    // 2. Fallback: Try decoding the token
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const decoded = JSON.parse(jsonPayload);
            const name = decoded.name || decoded.user?.name || (decoded.email ? decoded.email.split('@')[0] : "User");
            
            // Auto-save recovered name
            localStorage.setItem("userName", name);
            
            return {
                name: name,
                email: decoded.email || storedEmail,
                role: decoded.role || storedRole
            };
        } catch (e) {
            console.error("Token decode failed", e);
        }
    }

    // 3. Last resort
    return { name: "User", email: "", role: "" };
};

export const getUserId = () => {
    if (typeof window === "undefined") return null;
    
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        return decoded.id || decoded._id || decoded.userId || null;
    } catch (e) {
        console.error("Token decode failed for ID", e);
        return null;
    }
};
