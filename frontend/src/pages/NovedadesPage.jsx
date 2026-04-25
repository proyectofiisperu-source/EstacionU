import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

    const [novedades, setNovedades] = useState([]);
    const [loadingNovedades, setLoadingNovedades] = useState(true);
    const [selectedNovedad, setSelectedNovedad] = useState(null);

    useEffect(() => {
        if (selectedNovedad) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedNovedad]);

    useEffect(() => {
        const fetchNovedades = async () => {
            try {
                const res = await fetch('/api/novedades/');
                if (res.ok) {
                    setNovedades(await res.json());
                }
            } catch (error) {
                console.error("Error fetching novedades", error);
            } finally {
                setLoadingNovedades(false);
            }
        };
        fetchNovedades();
    }, []);

    // Also the auth logic is there, but for a public page we can just show it.
    // Wait, currently NovedadesPage redirects logged in users to their dashboards.
    // The prompt says "en la ventana de novedades", I'll keep the auth logic but just render the content instead of the "Próximamente" message.

    if (loading || loadingNovedades) {
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
                    <div className="text-center mb-8 animate-fade-in-up">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                            Novedades
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                            Entérate de las últimas actualizaciones, ofertas laborales y eventos en EstaciónU+.
                        </p>
                    </div>
                    
                    {novedades.length === 0 ? (
                        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-12 border border-slate-200 dark:border-slate-700 shadow-xl max-w-4xl mx-auto text-center animate-scale-in">
                            <p className="text-lg text-slate-500 dark:text-slate-400">
                                Próximamente estaremos compartiendo las últimas novedades aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {novedades.map((novedad, index) => (
                                <div 
                                    key={novedad.id} 
                                    className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col relative border border-slate-100 dark:border-slate-700 hover:-translate-y-2 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Image Section */}
                                    <div className="h-48 sm:h-56 relative overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 cursor-pointer" onClick={() => setSelectedNovedad(novedad)}>
                                        {novedad.url_imagen_principal ? (
                                            <img 
                                                src={novedad.url_imagen_principal} 
                                                alt={novedad.titulo} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                <span className="material-icons text-6xl text-primary/20">newspaper</span>
                                            </div>
                                        )}
                                        
                                        {/* Company Badge overlay */}
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-3 shadow-lg border border-white/20 dark:border-slate-700/50">
                                            {novedad.url_imagen_empresa ? (
                                                <img src={novedad.url_imagen_empresa} alt={novedad.empresa} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <span className="material-icons text-[24px] text-slate-500 p-1">business</span>
                                            )}
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{novedad.empresa || 'EstaciónU+'}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Content Section */}
                                    <div className="flex-1 p-6 flex flex-col justify-between relative bg-white dark:bg-slate-800">
                                        <div className="cursor-pointer flex-1" onClick={() => setSelectedNovedad(novedad)}>
                                            <div className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                                <span className="material-icons text-[16px]">event_note</span>
                                                {new Date(novedad.fecha_creacion).toLocaleDateString()}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                                {novedad.titulo}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">
                                                {novedad.descripcion}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-6 flex items-center gap-3">
                                            <button 
                                                onClick={() => setSelectedNovedad(novedad)}
                                                className="flex-1 text-center py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-primary rounded-xl text-sm font-bold transition-colors"
                                            >
                                                Ver más detalles
                                            </button>
                                            {novedad.url && (
                                                <a 
                                                    href={novedad.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
                                                    title="Ir al enlace"
                                                >
                                                    <span className="material-icons text-[20px]">launch</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Novedad */}
            {selectedNovedad && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedNovedad(null)}>
                    <div 
                        className="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Left Side - Image */}
                        <div className="md:w-1/2 bg-slate-100 dark:bg-slate-900 relative">
                            {selectedNovedad.url_imagen_principal ? (
                                <img 
                                    src={selectedNovedad.url_imagen_principal} 
                                    alt={selectedNovedad.titulo} 
                                    className="w-full h-64 md:h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-64 md:h-full flex items-center justify-center">
                                    <span className="material-icons text-6xl text-slate-300">image</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Side - Content */}
                        <div className="md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    {selectedNovedad.url_imagen_empresa ? (
                                        <img src={selectedNovedad.url_imagen_empresa} alt={selectedNovedad.empresa} className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="material-icons text-primary">business</span>
                                        </div>
                                    )}
                                    <span className="font-black text-slate-800 dark:text-slate-200">{selectedNovedad.empresa || 'EstaciónU+'}</span>
                                </div>
                                <button onClick={() => setSelectedNovedad(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="flex-1">
                                <div className="text-sm font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                    <span className="material-icons text-[16px]">event_note</span>
                                    {new Date(selectedNovedad.fecha_creacion).toLocaleDateString()}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                                    {selectedNovedad.titulo}
                                </h2>
                                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-base leading-relaxed">
                                    {selectedNovedad.descripcion}
                                </div>
                            </div>

                            {selectedNovedad.url && (
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <a 
                                        href={selectedNovedad.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-md shadow-primary/20 hover:-translate-y-1"
                                    >
                                        Visitar enlace <span className="material-icons text-[20px]">launch</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
};

export default NovedadesPage;
