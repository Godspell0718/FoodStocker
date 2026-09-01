import NavbarPublica from './navBarPublica';
import { Phone, Mail, MessageCircle, MapPin, ExternalLink } from 'lucide-react'; 
// MessageCircle puede ser alternativa a whatsapp, pero en este caso se usará el ícono de WhatsApp directamente con SVG simple icons, no lucide ya que lucide no tiene logos

const ContactoPublico = () => {
    return (
        <div className="tw-h-screen tw-bg-slate-50 tw-font-sans tw-flex tw-flex-col tw-overflow-hidden">
            <NavbarPublica />

            <main className="tw-flex-1 tw-overflow-y-auto">
                <div className="tw-animate-fade-in tw-flex tw-flex-col tw-items-center tw-text-center tw-py-12 tw-px-4 tw-max-w-6xl tw-mx-auto tw-w-full">
                    <h1 className="tw-text-4xl tw-font-bold tw-text-slate-900 tw-mb-6">Contáctanos</h1>
                    <p className="tw-text-lg tw-text-slate-600 tw-leading-relaxed tw-mb-12 tw-max-w-3xl">
                        Estamos aquí para ayudarte. No dudes en ponerte en contacto con nosotros a través de cualquiera de los siguientes medios.
                    </p>

                    {/* Mapa de Google Maps */}
                    <div className="tw-w-full tw-h-[400px] tw-bg-slate-200 tw-rounded-2xl tw-overflow-hidden tw-shadow-md tw-mb-10 tw-border tw-border-slate-200">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.242636305717!2d-74.9272525!3d4.1726434999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3ed3e7f32bc353%3A0x17c49f902cb02ef7!2sCentro%20Agropecuario%20La%20granja%20Sena!5e0!3m2!1ses-419!2sco!4v1787767417244!5m2!1ses-419!2sco"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            title="Mapa de ubicación"
                        />
                    </div>

                    {/* Tarjetas de Contacto Rápidas */}
                    <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-5 tw-gap-4 tw-w-full">
                        <div className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-gap-4 tw-border tw-border-slate-100 hover:tw-shadow-md tw-transition-shadow">
                            <Phone className="tw-text-blue-500 tw-w-6 tw-h-6 tw-flex-shrink-0" />
                            <div className="tw-text-left">
                                <h4 className="tw-font-bold tw-text-slate-800 tw-text-sm">Teléfono</h4>
                                <p className="tw-text-xs tw-text-slate-500">+57 310 000 0000</p>
                            </div>
                        </div>
                        <div className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-gap-4 tw-border tw-border-slate-100 hover:tw-shadow-md tw-transition-shadow">
                            <Mail className="tw-text-red-500 tw-w-6 tw-h-6 tw-flex-shrink-0" />
                            <div className="tw-text-left">
                                <h4 className="tw-font-bold tw-text-slate-800 tw-text-sm">Correo</h4>
                                <p className="tw-text-xs tw-text-slate-500">contacto@sena.edu.co</p>
                            </div>
                        </div>
                        <div className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-gap-4 tw-border tw-border-slate-100 hover:tw-shadow-md tw-transition-shadow">
                            <svg
                                role="img"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                className="tw-w-5 tw-h-5 tw-flex-shrink-0 tw-text-green-500"
                                fill="currentColor"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            <div className="tw-text-left">
                                <h4 className="tw-font-bold tw-text-slate-800 tw-text-sm">WhatsApp</h4>
                                <p className="tw-text-xs tw-text-slate-500">+57 300 000 0000</p>
                            </div>
                        </div>
                        <div className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-gap-4 tw-border tw-border-slate-100 hover:tw-shadow-md tw-transition-shadow">
                            <MapPin className="tw-text-red-500 tw-w-6 tw-h-6 tw-flex-shrink-0" />
                            <div className="tw-text-left">
                                <h4 className="tw-font-bold tw-text-slate-800 tw-text-sm">Dirección</h4>
                                <p className="tw-text-[11px] tw-text-slate-500 tw-leading-tight">53C9+PV, Km 2, Chicoral, Macegal, El Espinal</p>
                            </div>
                        </div>
                        <a
                            href="https://senalagranja.blogspot.com"
                            target="_blank"
                            rel="noreferrer"
                            className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-gap-4 tw-border tw-border-slate-100 hover:tw-shadow-md tw-transition-shadow tw-cursor-pointer tw-no-underline"
                        >
                            <ExternalLink className="tw-text-purple-500 tw-w-6 tw-h-6 tw-flex-shrink-0" />
                            <div className="tw-text-left">
                                <h4 className="tw-font-bold tw-text-slate-800 tw-text-sm">Blog SENA</h4>
                                <p className="tw-text-xs tw-text-slate-500">Visitar blog oficial</p>
                            </div>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactoPublico;