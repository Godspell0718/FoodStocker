import { FileText, Maximize2, Download } from 'lucide-react';
import NavbarPublica from './navBarPublica';

const DocumentosPublicos = () => {
    return (
        <div className="tw-min-h-screen tw-bg-slate-50 tw-font-sans tw-flex tw-flex-col">
            <NavbarPublica />
            
            <main className="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-start tw-pt-8">
                <div className="tw-animate-fade-in tw-flex tw-flex-col tw-items-center tw-text-center tw-py-16 tw-px-4 tw-max-w-4xl tw-mx-auto">
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-4 tw-mb-6">
                        <div className="tw-w-12 tw-h-12 tw-bg-secundario-200 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-md">
                            <FileText className="tw-text-primario-900 tw-w-6 tw-h-6" />
                        </div>
                        <h1 className="tw-text-4xl tw-font-bold tw-text-slate-900">Manual de Usuario FoodStocker</h1>
                    </div>
                    <p className="tw-text-lg tw-text-slate-600 tw-leading-relaxed tw-mb-10">
                        Este manual de usuario presenta una guía clara y completa sobre el uso del sistema FoodStocker. 
                        Está dirigido a aprendices, responsables y administradores, proporcionando instrucciones 
                        detalladas sobre cada módulo, así como recomendaciones para su uso eficiente y correcto. El 
                        objetivo es facilitar la comprensión y manejo del sistema por parte de todos los usuarios.
                    </p>

                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-w-full sm:tw-w-auto">
                        <button className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-8 tw-py-3 tw-bg-primario-900 tw-text-white tw-rounded-lg tw-font-medium hover:tw-bg-secundario-200 hover:tw-text-primario-900 tw-transition-colors tw-shadow-sm tw-border-none">
                            <Maximize2 className="tw-w-5 tw-h-5" />
                            Ver PDF
                        </button>
                        <button className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-8 tw-py-3 tw-bg-primario-900 tw-text-white tw-border tw-border-none tw-rounded-lg tw-font-medium hover:tw-bg-secundario-200 hover:tw-text-primario-900 tw-transition-colors tw-shadow-sm">
                            <Download className="tw-w-5 tw-h-5" />
                            Descargar
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DocumentosPublicos;