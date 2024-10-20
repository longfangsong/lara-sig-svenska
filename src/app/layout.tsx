import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  DarkThemeToggle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  ThemeModeScript,
} from "flowbite-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./_components/SignOutButton";
import SignInButton from "./_components/SignInButton";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Lära sig svenska",
  description: "An app for learning Swedish",
};

async function NavBar() {
  const session = await auth();
  return (
    <Navbar
      fluid
      className="items-center justify-between border-b border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    >
      <NavbarBrand href={process.env.CF_PAGES_URL}>
        <span className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Lära Svenska
        </span>
      </NavbarBrand>
      <div className="flex flex-row justify-between items-center gap-2 md:order-2">
        <DarkThemeToggle />
        {session?.user ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-9 h-9 rounded"
              src={session.user?.image!}
              alt={session.user.name || ""}
            />
            <SignOutButton />
          </>
        ) : (
          <SignInButton />
        )}
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink href={process.env.CF_PAGES_URL + "/articles"}>
          Articles
        </NavbarLink>
        <NavbarLink href={process.env.CF_PAGES_URL + "/words"}>
          Words
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ThemeModeScript />
      </head>
      <body className={inter.className}>
        <NavBar />
        <main className="p-2 sm:p-4 text-gray-900 dark:text-white">
          {children}
        </main>
      </body>
    </html>
  );
}
