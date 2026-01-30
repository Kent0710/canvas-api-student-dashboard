import { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, Settings } from "lucide-react";

import Sidebar from "./Sidebar";

function Dashboard() {
    const [data, setData] = useState({ courses: [], assignments: [] });

    useEffect(() => {
        // Fetches will be implemented here to call your backend
    }, []);


    return (
        <div>
            maint content of the dashboard
        </div>
    );
}

export default Dashboard;
