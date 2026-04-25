export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-accent">Bienvenido a Aura OS</h1>
                <p className="text-foreground/70 mt-2">Centro de control del ecosistema operativo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">Desarrollo</h3>
                    <p className="text-sm text-foreground/60">Gestiona proyectos y código.</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">Laboratorio</h3>
                    <p className="text-sm text-foreground/60">Experimentación e innovación.</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold mb-2">Finanzas</h3>
                    <p className="text-sm text-foreground/60">Control de ingresos y egresos.</p>
                </div>
            </div>
        </div>
    )
}
