import { Link } from "react-router-dom";
import { GraduationCap, LayoutDashboard, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

function Sidebar() {
    const location = useLocation();

    const routes = useMemo(
        () => [
            {
                label: "Dashboard",
                routes: "/dashboard",
                icon: LayoutDashboard,
                fill: "#a1a1a1",
                active: location.pathname === "/dashboard",
            },
            {
                label: "Settings",
                routes: "/settings",
                icon: Settings,
                fill: undefined,
                active: location.pathname === "/settings",
            },
        ],
        [location],
    );

    return (
        <div className="flex-[20%] border-r-2 border-[#1c2735] p-4">
            <section className="flex items-center gap-2 ">
                <div className="bg-[#39e079] w-12 h-12 flex items-center justify-center rounded-lg">
                    <GraduationCap size={32} />
                </div>
                <div>
                    <h2 className="font-bold"> Canvas Workspace </h2>
                    <p className="text-sm text-neutral-400 font-semibold">
                        {" "}
                        Student Dashboard{" "}
                    </p>
                </div>
            </section>
            <nav className="mt-6">
                {routes.map((route) => (
                    <Link to={route.routes} key={route.label}>
                        <div className={`
                                flex items-center my-2 gap-2 text-neutral-400 hover:bg-[#163320] rounded-lg
                                ${route.active ? "bg-[#163320]" : ""}
                            `}>
                            <div className="w-12 h-12 flex items-center justify-center rounded-lg">
                                <route.icon
                                    size={27}
                                    fill={route.fill || undefined}
                                />
                            </div>
                            <p className="font-medium">{route.label}</p>
                        </div>
                    </Link>
                ))}
            </nav>
        </div>
    );
}

export default Sidebar;
