import Sidebar from "./Sidebar";

function PageTemplate({ children }) {
    return (
        <div className="flex h-screen w-full">
            <Sidebar />

            <main className="flex-[80%] p-4">{children}</main>
        </div>
    );
}

export default PageTemplate;
