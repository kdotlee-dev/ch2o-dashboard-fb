import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
    AlertTriangle,
    Factory,
    Home as HomeIcon,
    HeartPulse,
    ShieldCheck,
    Activity,
    Thermometer,
    Cpu,
    Wifi,
} from 'lucide-react';

const healthEffects = [
    {
        level: 'Low Exposure',
        range: '0.03 – 0.1 ppm',
        description:
            'Barely perceptible odor. Sensitive individuals may experience mild eye irritation or a slight itchy throat.',
        color: 'text-emerald-500',
        bar: 'bg-emerald-500',
    },
    {
        level: 'Moderate Exposure',
        range: '0.1 – 0.5 ppm',
        description:
            'Noticeable eye, nose, and throat irritation. Prolonged exposure can trigger headaches and worsen asthma symptoms.',
        color: 'text-yellow-500',
        bar: 'bg-yellow-500',
    },
    {
        level: 'High Exposure',
        range: '0.5 – 2.0 ppm',
        description:
            'Significant respiratory discomfort, coughing, watering eyes, and potential skin irritation upon contact.',
        color: 'text-orange-500',
        bar: 'bg-orange-500',
    },
    {
        level: 'Hazardous',
        range: '> 2.0 ppm',
        description:
            'Severe airway inflammation, breathing difficulty, and long-term exposure is linked to increased cancer risk.',
        color: 'text-red-500',
        bar: 'bg-red-500',
    },
];

const sources = [
    {
        icon: HomeIcon,
        title: 'Inside the Home',
        text: 'Pressed-wood furniture, laminate flooring, foam insulation, carpets, paints, and household cleaners.',
    },
    {
        icon: Factory,
        title: 'Industrial & Workplace',
        text: 'Manufacturing of resins, plastics, textiles, and embalming fluids; common in factories and laboratories.',
    },
    {
        icon: AlertTriangle,
        title: 'Combustion & Smoke',
        text: 'Tobacco smoke, gas stoves, wood burning, candles, and vehicle exhaust all release formaldehyde into the air.',
    },
];

const deviceFeatures = [
    {
        icon: Activity,
        title: 'Real-time Monitoring',
        text: 'Continuous readings of formaldehyde concentration in ppm, streamed live from the sensor to your dashboard.',
    },
    {
        icon: Thermometer,
        title: 'Environmental Context',
        text: 'Tracks ambient temperature and humidity, which directly influence how formaldehyde off-gases from materials.',
    },
    {
        icon: Cpu,
        title: 'Onboard OLED Display',
        text: 'A compact screen shows current readings and safety status right on the device — no phone required.',
    },
    {
        icon: Wifi,
        title: 'Cloud Sync',
        text: 'Readings are uploaded to Firebase, letting you review historical trends and access data from anywhere.',
    },
];

export const About = () => {
    return (
        <div className='min-h-screen bg-background text-foreground'>
            <Navbar />

            <main className='pt-28 pb-20'>
                <section className='container max-w-5xl mx-auto px-4'>
                    <div className='text-center space-y-4 mb-16'>
                        <p className='text-sm font-semibold tracking-widest text-primary uppercase'>
                            About CH2O Monitor
                        </p>
                        <h1 className='text-4xl md:text-6xl font-bold tracking-tight'>
                            Understanding the Air{' '}
                            <span className='text-primary text-glow'>Around You</span>
                        </h1>
                        <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                            Formaldehyde (CH₂O) is an invisible, odor-subtle chemical that lingers in
                            homes, offices, and factories. This project exists to make it visible,
                            measurable, and actionable.
                        </p>
                    </div>

                    {/* What is formaldehyde */}
                    <div className='grid md:grid-cols-2 gap-8 mb-20'>
                        <div className='space-y-4'>
                            <h2 className='text-2xl md:text-3xl font-bold'>
                                What is Formaldehyde?
                            </h2>
                            <p className='text-muted-foreground leading-relaxed'>
                                Formaldehyde is a colorless, strong-smelling gas used in the production
                                of building materials, household products, and industrial chemicals. It
                                occurs naturally in small amounts, but indoor concentrations often exceed
                                outdoor levels due to modern construction and furnishings.
                            </p>
                            <p className='text-muted-foreground leading-relaxed'>
                                Even at low concentrations, prolonged exposure can cause respiratory
                                irritation, allergic reactions, and — according to the World Health
                                Organization — is classified as a Group 1 human carcinogen.
                            </p>
                        </div>

                        <div className='rounded-xl border border-border bg-card p-6 space-y-4 card-hover'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                                    <HeartPulse className='h-5 w-5' />
                                </div>
                                <h3 className='font-semibold text-lg'>Why it matters</h3>
                            </div>
                            <ul className='space-y-3 text-sm text-muted-foreground'>
                                <li className='flex gap-2'>
                                    <span className='text-primary mt-1'>•</span>
                                    <span>Most people spend 90% of their time indoors, where CH₂O concentrates.</span>
                                </li>
                                <li className='flex gap-2'>
                                    <span className='text-primary mt-1'>•</span>
                                    <span>New furniture and renovations can off-gas for months or even years.</span>
                                </li>
                                <li className='flex gap-2'>
                                    <span className='text-primary mt-1'>•</span>
                                    <span>Children, elderly, and asthmatics are particularly vulnerable.</span>
                                </li>
                                <li className='flex gap-2'>
                                    <span className='text-primary mt-1'>•</span>
                                    <span>You can’t rely on smell — symptoms often appear after exposure.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Common sources */}
                    <div className='mb-20'>
                        <div className='text-center mb-10 space-y-2'>
                            <h2 className='text-2xl md:text-3xl font-bold'>Common Sources</h2>
                            <p className='text-muted-foreground'>
                                Formaldehyde shows up in more places than most people realize.
                            </p>
                        </div>
                        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {sources.map((s, i) => (
                                <div
                                    key={i}
                                    className='rounded-xl border border-border bg-card p-6 space-y-3 card-hover'
                                >
                                    <div className='inline-flex p-3 rounded-lg bg-primary/10 text-primary'>
                                        <s.icon className='h-6 w-6' />
                                    </div>
                                    <h3 className='font-semibold text-lg'>{s.title}</h3>
                                    <p className='text-sm text-muted-foreground leading-relaxed'>
                                        {s.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exposure levels */}
                    <div className='mb-20'>
                        <div className='text-center mb-10 space-y-2'>
                            <h2 className='text-2xl md:text-3xl font-bold'>Exposure Levels</h2>
                            <p className='text-muted-foreground'>
                                How concentration in parts-per-million (ppm) affects the body.
                            </p>
                        </div>
                        <div className='space-y-4'>
                            {healthEffects.map((e, i) => (
                                <div
                                    key={i}
                                    className='rounded-xl border border-border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4'
                                >
                                    <div className='flex items-center gap-4 md:w-64 shrink-0'>
                                        <div className={`w-1.5 h-12 rounded-full ${e.bar}`} />
                                        <div>
                                            <p className={`font-semibold ${e.color}`}>{e.level}</p>
                                            <p className='text-xs text-muted-foreground font-mono'>
                                                {e.range}
                                            </p>
                                        </div>
                                    </div>
                                    <p className='text-sm text-muted-foreground leading-relaxed flex-1'>
                                        {e.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className='text-xs text-muted-foreground mt-4 text-center'>
                            Thresholds based on WHO and OSHA guidelines. Individual sensitivity varies.
                        </p>
                    </div>

                    {/* Device */}
                    <div className='mb-20'>
                        <div className='text-center mb-10 space-y-2'>
                            <h2 className='text-2xl md:text-3xl font-bold'>The CH2O Monitor Device</h2>
                            <p className='text-muted-foreground max-w-2xl mx-auto'>
                                A custom-built IoT sensor that measures formaldehyde in real time and
                                syncs readings to this dashboard so you can react before it becomes a
                                problem.
                            </p>
                        </div>
                        <div className='grid sm:grid-cols-2 gap-6'>
                            {deviceFeatures.map((f, i) => (
                                <div
                                    key={i}
                                    className='rounded-xl border border-border bg-card p-6 flex gap-4 card-hover'
                                >
                                    <div className='shrink-0 p-3 rounded-lg bg-primary/10 text-primary h-fit'>
                                        <f.icon className='h-6 w-6' />
                                    </div>
                                    <div className='space-y-1'>
                                        <h3 className='font-semibold text-lg'>{f.title}</h3>
                                        <p className='text-sm text-muted-foreground leading-relaxed'>
                                            {f.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mission */}
                    <div className='rounded-2xl border border-border bg-card p-8 md:p-12 text-center space-y-4'>
                        <div className='inline-flex p-3 rounded-full bg-primary/10 text-primary'>
                            <ShieldCheck className='h-7 w-7' />
                        </div>
                        <h2 className='text-2xl md:text-3xl font-bold'>Our Mission</h2>
                        <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
                            To turn an invisible threat into clear, understandable data — empowering
                            families, workers, and businesses to take control of the air they breathe.
                            Because you can’t protect yourself from something you can’t see.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};
