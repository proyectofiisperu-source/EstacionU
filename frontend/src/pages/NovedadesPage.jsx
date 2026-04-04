import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LakeBackground from '../components/LakeBackground';

const NovedadesPage = () => {
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        if (user) {
            const role = (user.role || '').toLowerCase();
            const hasNoRole = !role || role === 'user' || role === 'usuario';
            if (hasNoRole || user.onboarding_completo === false) {
                // If they visit the landing page without finishing onboarding, treat it as an abort and log them out
                logout();
            }
        }
    }, [user, logout]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user) {
        // Enforce role selection and onboarding even if landing on the root page
        const role = (user.role || '').toLowerCase();
        const hasNoRole = !role || role === 'user' || role === 'usuario';

        if (hasNoRole || user.onboarding_completo === false) {
            // They are about to be logged out by useEffect, show loading state temporarily
            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            );
        }

        const isMentor = ['mentor', 'graduate', 'egresado'].includes(role);
        return <Navigate to={isMentor ? "/mentor/dashboard" : "/student/dashboard"} replace />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen relative">
            <LakeBackground blur="blur-[40px]" />
            <div className="relative z-10">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                        Novedades
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
                        Entérate de las últimas actualizaciones, noticias y eventos en EstaciónU+.
                    </p>
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-12 border border-slate-200 dark:border-slate-700 shadow-xl max-w-4xl mx-auto">
                        <p className="text-lg text-slate-500 dark:text-slate-400">
                            Próximamente estaremos compartiendo las últimas novedades aquí.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default NovedadesPage;
