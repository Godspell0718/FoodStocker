import NavbarPublica from './navBarPublica';

const QuienesSomos = () => {
    return (
        <div className="tw-min-h-screen tw-bg-slate-50 tw-font-sans tw-flex tw-flex-col tw-overflow-y-auto tw-h-screen tw-overflow-x-hidden">
            <NavbarPublica />

            <main className="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-start tw-pt-8 tw-pb-12 tw-overflow-y-auto">
                <div className="tw-animate-fade-in tw-flex tw-flex-col tw-items-center tw-text-center tw-py-12 tw-px-4 tw-max-w-6xl tw-mx-auto">
                    <h1 className="tw-text-4xl tw-font-bold tw-text-slate-900 tw-mb-6">Nuestro equipo</h1>
                    <p className="tw-text-lg tw-text-slate-600 tw-leading-relaxed tw-mb-12 tw-max-w-4xl">
                        Somos aprendices del Tecnólogo en Análisis y Desarrollo de Software del SENA, Centro
                        Agropecuario "La Granja". Nos apasiona la tecnología y trabajamos en equipo para crear
                        soluciones útiles e innovadoras, fortaleciendo nuestras habilidades mediante el aprendizaje
                        colaborativo y la mejora continua.
                    </p>

                    {/* CONTENEDOR FLEX */}
                    <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-8 tw-w-full">

                        {/* Tarjeta Andrey */}
                        <div className="tw-relative tw-w-72 tw-h-96 tw-overflow-hidden tw-rounded-2xl tw-shadow-lg tw-group tw-cursor-pointer">
                            <img
                                src="/A.F.Melo.jpg"
                                className="tw-w-full tw-h-full tw-object-cover"
                            />
                            <div className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-bg-white/30 tw-backdrop-blur-md tw-border tw-border-white/20 tw-flex tw-flex-col tw-p-6 tw-transform tw-transition-transform tw-duration-500 tw-ease-in-out tw-translate-x-full group-hover:tw-translate-x-0">
                                <div className="tw-mb-4">
                                    <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">
                                        Andrey Felipe Melo Trejo
                                    </h2>
                                    <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-uppercase tw-tracking-wider">
                                        Gerente de Proyecto y Líder de Equipo
                                    </h3>
                                </div>
                                <p className="tw-text-sm tw-text-gray-800 tw-flex-grow">
                                    Experto en cosas asi bien raras
                                </p>
                                <div className="tw-mt-auto tw-pt-4 tw-border-t tw-border-white/40 tw-flex tw-justify-center">
                                    <p
                                        className="tw-text-sm tw-font-bold tw-text-gray-900 tw-text-center tw-truncate tw-max-w-full"
                                        title="andreyfelipemelotrejo@gmail.com"
                                    >
                                        andreyfelipemelotrejo@gmail.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta Campos */}
                        <div className="tw-relative tw-w-72 tw-h-96 tw-overflow-hidden tw-rounded-2xl tw-shadow-lg tw-group tw-cursor-pointer">
                            <img
                                src="/J.S.Campos.jpg"
                                className="tw-w-full tw-h-full tw-object-cover"
                            />
                            <div className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-bg-white/30 tw-backdrop-blur-md tw-border tw-border-white/20 tw-flex tw-flex-col tw-p-6 tw-transform tw-transition-transform tw-duration-500 tw-ease-in-out tw-translate-x-full group-hover:tw-translate-x-0">
                                <div className="tw-mb-4">
                                    <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">
                                        Juan Sebastian Campos Campos
                                    </h2>
                                    <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-uppercase tw-tracking-wider">
                                        Sub Gerente de Proyecto y Líder de Equipo
                                    </h3>
                                </div>
                                <p className="tw-text-sm tw-text-gray-800 tw-flex-grow">
                                    Experto en bases de datos cuanticas y arquitectura de sistemas distribuidos. Lidera el equipo con visión estratégica y enfoque en la innovación en el area de la tecnología cuantica .
                                </p>
                                <div className="tw-mt-auto tw-pt-4 tw-border-t tw-border-white/40 tw-flex tw-justify-center">
                                    <p
                                        className="tw-text-sm tw-font-bold tw-text-gray-900 tw-text-center tw-truncate tw-max-w-full"
                                        title="juansebastiancamposcampos@gmail.com"
                                    >
                                        juansebastiancamposcampos@gmail.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta Valbuena */}
                        <div className="tw-relative tw-w-72 tw-h-96 tw-overflow-hidden tw-rounded-2xl tw-shadow-lg tw-group tw-cursor-pointer">
                            <img
                                src="/J.S.Valbuena.jpg"
                                className="tw-w-full tw-h-full tw-object-cover"
                            />
                            <div className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-bg-white/30 tw-backdrop-blur-md tw-border tw-border-white/20 tw-flex tw-flex-col tw-p-6 tw-transform tw-transition-transform tw-duration-500 tw-ease-in-out tw-translate-x-full group-hover:tw-translate-x-0">
                                <div className="tw-mb-4">
                                    <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">
                                        Juan Sebastian Valbuena Ortiz
                                    </h2>
                                    <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-uppercase tw-tracking-wider">
                                        Analista y Desarrollador de Software
                                    </h3>
                                </div>
                                <p className="tw-text-sm tw-text-gray-800 tw-flex-grow">
                                    lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores necessitatibus nihil dolore placeat porro labore ut beatae repellat alias possimus maxime iure voluptatum vel reprehenderit eos sapiente cupiditate, inventore nemo.
                                </p>
                                <div className="tw-mt-auto tw-pt-4 tw-border-t tw-border-white/40 tw-flex tw-justify-center">
                                    <p
                                        className="tw-text-sm tw-font-bold tw-text-gray-900 tw-text-center tw-truncate tw-max-w-full"
                                        title="jsebastian.valbuena@gmail.com"
                                    >
                                        jsebastian.valbuena@gmail.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta Linkon */}
                        <div className="tw-relative tw-w-72 tw-h-96 tw-overflow-hidden tw-rounded-2xl tw-shadow-lg tw-group tw-cursor-pointer">
                            <img
                                src="/L.J.Vargas.jpg"
                                className="tw-w-full tw-h-full tw-object-cover"
                            />
                            <div className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-bg-white/30 tw-backdrop-blur-md tw-border tw-border-white/20 tw-flex tw-flex-col tw-p-6 tw-transform tw-transition-transform tw-duration-500 tw-ease-in-out tw-translate-x-full group-hover:tw-translate-x-0">
                                <div className="tw-mb-4">
                                    <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">
                                        Linkon Joel Vargas Gonzales
                                    </h2>
                                    <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-uppercase tw-tracking-wider">
                                        Analista y Desarrollador de Software
                                    </h3>
                                </div>
                                <p className="tw-text-sm tw-text-gray-800 tw-flex-grow">
                                    lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores necessitatibus nihil dolore placeat porro labore ut beatae repellat alias possimus maxime iure voluptatum vel reprehenderit eos sapiente cupiditate, inventore nemo.
                                </p>
                                <div className="tw-mt-auto tw-pt-4 tw-border-t tw-border-white/40 tw-flex tw-justify-center">
                                    <p
                                        className="tw-text-sm tw-font-bold tw-text-gray-900 tw-text-center tw-truncate tw-max-w-full"
                                        title="linkonvargas@gmail.com"
                                    >
                                        linkonvargas@gmail.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta Dylan */}
                        <div className="tw-relative tw-w-72 tw-h-96 tw-overflow-hidden tw-rounded-2xl tw-shadow-lg tw-group tw-cursor-pointer">
                            <img
                                src="/D.S.Aguilar.jpg"
                                className="tw-w-full tw-h-full tw-object-cover"
                            />
                            <div className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-bg-white/30 tw-backdrop-blur-md tw-border tw-border-white/20 tw-flex tw-flex-col tw-p-6 tw-transform tw-transition-transform tw-duration-500 tw-ease-in-out tw-translate-x-full group-hover:tw-translate-x-0">
                                <div className="tw-mb-4">
                                    <h2 className="tw-text-2xl tw-font-bold tw-text-gray-900">
                                        Dylan Said Aguilar Rivera
                                    </h2>
                                    <h3 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-uppercase tw-tracking-wider">
                                        Analista y Desarrollador de Software
                                    </h3>
                                </div>
                                <p className="tw-text-sm tw-text-gray-800 tw-flex-grow">
                                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores necessitatibus nihil dolore placeat porro labore ut beatae repellat alias possimus maxime iure voluptatum vel reprehenderit eos sapiente cupiditate, inventore nemo.
                                </p>
                                <div className="tw-mt-auto tw-pt-4 tw-border-t tw-border-white/40 tw-flex tw-justify-center">
                                    <p
                                        className="tw-text-sm tw-font-bold tw-text-gray-900 tw-text-center tw-truncate tw-max-w-full"
                                        title="dylanaguilar@gmail.com"
                                    >
                                        dylanaguilar@gmail.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QuienesSomos;