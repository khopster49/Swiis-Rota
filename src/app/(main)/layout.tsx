import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { UnreadSync } from "@/components/layout/unread-sync";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <UnreadSync />
      {children}
      <BottomNav />
    </>
  );
}
