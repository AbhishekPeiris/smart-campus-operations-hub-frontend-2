import { useCallback, useEffect, useRef, useState } from 'react';
import { getGoogleOAuthConfig, googleLogin } from '../../api/auth';
import { extractApiData } from '../../utils/apiData';

const GOOGLE_SCRIPT_ID = 'google-gsi-script';

export default function GoogleOAuthButton({ onAuthenticated }) {
    const buttonRef = useRef(null);
    const [clientId, setClientId] = useState('');
    const [configLoading, setConfigLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleResponse = useCallback(async (response) => {
        if (!response?.credential) return;

        setLoading(true);
        setError('');

        try {
            const res = await googleLogin(response.credential);
            const data = extractApiData(res);
            onAuthenticated?.(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    }, [onAuthenticated]);

    const renderGoogleButton = useCallback(() => {
        if (!clientId || !buttonRef.current || !window.google?.accounts?.id) return;

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
        });
    }, [clientId, handleGoogleResponse]);

    useEffect(() => {
        let isActive = true;

        getGoogleOAuthConfig()
            .then((res) => {
                if (!isActive) return;

                const config = extractApiData(res);
                if (config?.enabled && config?.clientId) {
                    setClientId(config.clientId);
                }
            })
            .catch((err) => {
                if (!isActive) return;
                setError(err.response?.data?.message || 'Google sign-in is not available right now');
            })
            .finally(() => {
                if (isActive) {
                    setConfigLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (!clientId) return undefined;

        if (window.google?.accounts?.id) {
            renderGoogleButton();
            return undefined;
        }

        let script = document.getElementById(GOOGLE_SCRIPT_ID);

        const handleLoad = () => renderGoogleButton();

        if (!script) {
            script = document.createElement('script');
            script.id = GOOGLE_SCRIPT_ID;
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        script.addEventListener('load', handleLoad);

        return () => {
            script.removeEventListener('load', handleLoad);
        };
    }, [clientId, renderGoogleButton]);

    return (
        <div className="space-y-2">
            {clientId ? (
                <div ref={buttonRef} className="flex min-h-10 justify-center" />
            ) : (
                <div className="flex min-h-10 items-center justify-center rounded-md border border-dashed border-border bg-white px-3 text-center text-xs text-text-muted">
                    {configLoading ? 'Loading Google sign-in...' : 'Google sign-in is not configured.'}
                </div>
            )}
            {loading && <p className="text-center text-xs text-text-muted">Signing in with Google...</p>}
            {error && <div className="soft-alert border-red-200 bg-red-50 text-danger">{error}</div>}
        </div>
    );
}