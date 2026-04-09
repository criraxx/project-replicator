import TopHeader from "./TopHeader";
import SubHeader from "./SubHeader";

interface NavItem {
  label: string;
  path: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  pageName: string;
  navItems: NavItem[];
  notificationCount?: number;
}

const AppLayout = ({ children, pageName, navItems, notificationCount }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <SubHeader pageName={pageName} navItems={navItems} notificationCount={notificationCount} />
      <main className="max-w-[1360px] mx-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
