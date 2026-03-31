"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function Profile() {
  const handleLogout = async () => {
    try {
      const res =  await fetch("/matdash-nextjs/api/logout", {
        method: "POST",
		"Content-Type": "text/plain",
      });
		
      const data = await res.json();
	  if(data.status == 204){
		window.location.href = "/matdash-nextjs/auth/login";
	  }
	} catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative group/menu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src="/matdash-nextjs/images/profile/user-1.jpg"
              alt="Profile"
              height={35}
              width={35}
              className="rounded-full"
            />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-44 rounded-sm shadow-md p-2"
        >
          <DropdownMenuItem asChild>
            <Link
              href="/user-profile"
              className="px-3 py-2 flex items-center gap-3"
            >
              <Icon icon="solar:user-circle-outline" height={20} />
              My Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="#"
              className="px-3 py-2 flex items-center gap-3"
            >
              <Icon icon="solar:letter-linear" height={20} />
              My Account
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="#"
              className="px-3 py-2 flex items-center gap-3"
            >
              <Icon icon="solar:checklist-linear" height={20} />
              My Task
            </Link>
          </DropdownMenuItem>

          <div className="p-3 pt-0">
            {/* ✅ Correct Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              Logout
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}