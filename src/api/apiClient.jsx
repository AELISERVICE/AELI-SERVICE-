const API_URL = import.meta.env.VITE_API_URL;

export const request = async (endpoint, method = "GET", body = null) => {
    let accessToken = localStorage.getItem('accessToken');

    const options = {
        method,
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
    };

    // LOGIQUE DE GESTION DU CORPS (BODY)
    if (body) {
        if (body instanceof FormData) {
            // Pour multipart/form-data (fichiers) : 
            // SURTOUT NE PAS mettre de Content-Type, le navigateur le fera.
            options.body = body;
        } else {
            // Pour les données classiques (JSON)
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }
    }

    let response = await fetch(`${API_URL}${endpoint}`, options);
    let data = await response.json();

    // LOGIQUE REFRESH TOKEN (On garde ta logique actuelle)
    if (!response.ok && data.code === "TOKEN_EXPIRED") {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken })
                });
                const refreshData = await refreshResponse.json();

                if (refreshResponse.ok) {
                    localStorage.setItem('accessToken', refreshData.accessToken);
                    options.headers["Authorization"] = `Bearer ${refreshData.accessToken}`;

                    // Rejouer la requête initiale
                    response = await fetch(`${API_URL}${endpoint}`, options);
                    data = await response.json();
                } else {
                    handleLogout();
                }
            } catch (err) {
                handleLogout();
            }
        } else {
            handleLogout();
        }
    }

    if (!response.ok) {
        const error = new Error(data.message || "Une erreur est survenue");
        error.response = data;
        throw error;
    }

    return data;
};

const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
};