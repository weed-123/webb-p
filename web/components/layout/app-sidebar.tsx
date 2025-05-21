"use client";

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'
import { ModeToggle } from "../theme-toggle";

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/settings', label: 'Settings' },
];

const operatorLinks = [
  { href: '/operator/dashboard', label: 'Dashboard' },
  { href: '/operator/reports', label: 'Reports' },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const isAdmin = user.role === 'administrator' || user.role === 'admin';
  const links = isAdmin ? adminLinks : operatorLinks;
  
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarGroup>
          <h2 className="text-xl font-bold">Weedout Online</h2>
          <p className="text-gray-400 text-sm capitalize">{user.role}</p>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={pathname === link.href}>
                      <Link href={link.href} onClick={handleNavigation(link.href)}>
                        {link.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="absolute bottom-4 flex flex-row gap-3">
            <ModeToggle />
            <Button
              onClick={logout}
              variant="outline"
              className="text-xs w-full"
            >
              Logout
            </Button>
          </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
