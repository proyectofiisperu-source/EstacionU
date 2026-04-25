import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import FluidBackground from '../components/FluidBackground';

const AdminNovedadesPage = () => {
    const [novedades, setNovedades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingNovedad, setEditingNovedad] = useState(null);
    const [uploadingImage, setUploadingImage] = useState({ url_imagen_principal: false, url_imagen_empresa: false });
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        url: '',
        url_imagen_empresa: '',
        empresa: '',
        url_imagen_principal: ''
    });

    useEffect(() => {
        fetchNovedades();
    }, []);

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [modalOpen]);

    const fetchNovedades = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/novedades/');
            if (res.ok) {
                setNovedades(await res.json());
            }
        } catch (error) {
            console.error('Error fetching novedades', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(prev => ({ ...prev, [field]: true }));
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/novedades/upload-image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, [field]: data.url }));
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.detail || 'No se pudo subir la imagen'}`);
            }
        } catch (error) {
            console.error('Error uploading image', error);
            alert('Error al subir la imagen. Por favor, intenta de nuevo.');
        } finally {
            setUploadingImage(prev => ({ ...prev, [field]: false }));
        }
    };

    const openCreateModal = () => {
        setEditingNovedad(null);
        setFormData({
            titulo: '',
            descripcion: '',
            url: '',
            url_imagen_empresa: '',
            empresa: '',
            url_imagen_principal: ''
        });
        setModalOpen(true);
    };

    const openEditModal = (novedad) => {
        setEditingNovedad(novedad);
        setFormData({
            titulo: novedad.titulo || '',
            descripcion: novedad.descripcion || '',
            url: novedad.url || '',
            url_imagen_empresa: novedad.url_imagen_empresa || '',
            empresa: novedad.empresa || '',
            url_imagen_principal: novedad.url_imagen_principal || ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta novedad?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/novedades/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchNovedades();
            }
        } catch (error) {
            console.error('Error deleting novedad', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const isEditing = !!editingNovedad;
            const url = isEditing ? `/api/novedades/${editingNovedad.id}` : '/api/novedades/';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setModalOpen(false);
                fetchNovedades();
            } else {
                console.error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving novedad', error);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300 relative">
            <FluidBackground />
            <div className="relative z-10">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <span className="material-icons text-primary text-3xl">campaign</span>
                                Gestión de Novedades
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Publica noticias, eventos y actualizaciones de empresas.</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-5 py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:scale-[1.02] flex items-center gap-2"
                        >
                            <span className="material-icons text-[18px]">add</span>
                            Nueva Publicación
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col p-6 animate-fade-in-up">
                        {loading ? (
                            <div className="flex items-center justify-center p-20"><span className="material-icons animate-spin text-4xl text-primary">refresh</span></div>
                        ) : novedades.length === 0 ? (
                            <div className="text-center p-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500 text-lg">
                                Aún no hay novedades publicadas.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-4 font-black">Empresa</th>
                                            <th className="p-4 font-black">Título</th>
                                            <th className="p-4 font-black">Fecha</th>
                                            <th className="p-4 font-black text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {novedades.map((novedad) => (
                                            <tr key={novedad.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {novedad.url_imagen_empresa ? (
                                                            <img src={novedad.url_imagen_empresa} alt={novedad.empresa} className="w-8 h-8 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                                <span className="material-icons text-sm text-slate-500">business</span>
                                                            </div>
                                                        )}
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{novedad.empresa || 'Sin empresa'}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm max-w-[300px] truncate">{novedad.titulo}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-slate-500">{new Date(novedad.fecha_creacion).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => openEditModal(novedad)}
                                                            className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <span className="material-icons text-[18px]">edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(novedad.id)}
                                                            className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <span className="material-icons text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-primary text-xl">{editingNovedad ? 'edit' : 'add_circle'}</span>
                                {editingNovedad ? 'Editar Publicación' : 'Nueva Publicación'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Título de la publicación *</label>
                                    <input 
                                        type="text" 
                                        name="titulo" 
                                        value={formData.titulo} 
                                        onChange={handleInputChange} 
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Ej: Oferta de Prácticas en Tech Corp"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Descripción *</label>
                                    <textarea 
                                        name="descripcion" 
                                        value={formData.descripcion} 
                                        onChange={handleInputChange} 
                                        required
                                        rows="4"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        placeholder="Detalles sobre la publicación..."
                                    ></textarea>
                                </div>

                                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/30">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="material-icons text-[16px]">business</span> EMPRESA ASOCIADA
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                            <label className={`w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all ${uploadingImage.url_imagen_empresa ? 'opacity-50 pointer-events-none' : ''} ${formData.url_imagen_empresa ? 'border-transparent' : 'border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                {formData.url_imagen_empresa ? (
                                                    <img src={formData.url_imagen_empresa} alt="Logo Empresa" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-400">
                                                        {uploadingImage.url_imagen_empresa ? (
                                                            <span className="material-icons animate-spin text-3xl">refresh</span>
                                                        ) : (
                                                            <span className="material-icons text-3xl">add_photo_alternate</span>
                                                        )}
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                                    onChange={(e) => handleImageUpload(e, 'url_imagen_empresa')}
                                                    disabled={uploadingImage.url_imagen_empresa}
                                                />
                                            </label>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PNG/JPEG, Max 100MB</p>
                                            {formData.url_imagen_empresa && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, url_imagen_empresa: '' }))}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-1"
                                                >
                                                    <span className="material-icons text-[14px]">delete</span> Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de Empresa</label>
                                            <input 
                                                type="text" 
                                                name="empresa" 
                                                value={formData.empresa} 
                                                onChange={handleInputChange} 
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-slate-800 dark:text-slate-200 shadow-sm"
                                                placeholder="Ej: BCP"
                                            />
                                            <p className="text-xs text-slate-500 mt-2 font-medium">Nombre de la empresa que publica o patrocina la novedad.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-slate-100 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/30">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span className="material-icons text-[16px]">image</span> IMAGEN PRINCIPAL / FLYER
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                            <label className={`w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all ${uploadingImage.url_imagen_principal ? 'opacity-50 pointer-events-none' : ''} ${formData.url_imagen_principal ? 'border-transparent bg-slate-100 dark:bg-slate-900' : 'border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                {formData.url_imagen_principal ? (
                                                    <img src={formData.url_imagen_principal} alt="Flyer" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-400">
                                                        {uploadingImage.url_imagen_principal ? (
                                                            <span className="material-icons animate-spin text-4xl">refresh</span>
                                                        ) : (
                                                            <span className="material-icons text-4xl">add_photo_alternate</span>
                                                        )}
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                                    onChange={(e) => handleImageUpload(e, 'url_imagen_principal')}
                                                    disabled={uploadingImage.url_imagen_principal}
                                                />
                                            </label>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PNG/JPEG, Max 100MB</p>
                                            {formData.url_imagen_principal && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, url_imagen_principal: '' }))}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-1"
                                                >
                                                    <span className="material-icons text-[14px]">delete</span> Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-3">
                                                Sube una imagen atractiva que represente la noticia, evento u oferta laboral.
                                            </p>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start">
                                                <span className="material-icons text-blue-500 text-lg">info</span>
                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                    Esta imagen se mostrará en la tarjeta principal de la ventana de Novedades. Recomendamos imágenes cuadradas para una mejor visualización en la grilla.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">URL de Enlace (Más información)</label>
                                    <input 
                                        type="url" 
                                        name="url" 
                                        value={formData.url} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                                    <button 
                                        type="button" 
                                        onClick={() => setModalOpen(false)}
                                        className="px-5 py-2 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-5 py-2 text-white font-bold bg-primary hover:bg-blue-600 rounded-xl transition-colors shadow-md shadow-primary/20"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
};

export default AdminNovedadesPage;
