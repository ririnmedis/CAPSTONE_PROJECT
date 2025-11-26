import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, FileCheck, UserCog, Copy } from 'lucide-react';
import AppLogo from './app-logo';

// mainNavItems will be computed inside the component so we can adapt links
// depending on whether the current user is an admin.

export function AppSidebar() {
    const page: any = (window as any).__INERTIA__?.page || {};
    const props = page.props || {};
    const isAdmin = props.isAdmin || false;
    
    // Fallback: jika sedang di /admin path, anggap sebagai admin
    const isOnAdminPath = window.location.pathname.startsWith('/admin');
    const shouldShowAdminSidebar = isAdmin || isOnAdminPath;

    let mainNavItems: NavItem[] = [];

    if (shouldShowAdminSidebar) {        
        // Admins see admin dashboard and admin section
        mainNavItems = [
            {
                title: 'Dashboard',
                href: '/admin',
                icon: LayoutGrid,
            },
            {
                title: 'Verifikasi Kegiatan',
                href: '/admin/kegiatans',
                icon: FileCheck,
            },
            {
                title: 'Kelola User',
                href: '/admin/users',
                icon: UserCog,
            },
            {
                title: 'Periksa Duplikasi Dokumen',
                href: '/admin/duplicates',
                icon: Copy,
            },
        ];
    } else {
        // Regular users see the normal dashboard
        mainNavItems = [
            {
                title: 'Dashboard',
                href: dashboard.url(),
                icon: LayoutGrid,
            },
        ];
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={shouldShowAdminSidebar ? '/admin' : dashboard.url()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
