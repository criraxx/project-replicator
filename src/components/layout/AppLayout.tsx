import TopHeader from "./TopHeader";
import SubHeader from "./SubHeader";
import Footer from "./Footer";

interface NavItem {
  label: string;
  path: string;
}

export interface AppLayoutProps {
  children: React.ReactNode;
  pageName: string;
  navItems: NavItem[];
  notificationCount?: number;
}

const AppLayout = ({ children, pageName, navItems, notificationCount }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopHeader />
      <SubHeader pageName={pageName} navItems={navItems} notificationCount={notificationCount} />
      <main className="max-w-[1360px] mx-auto p-6 flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
