import { useMemo, useState } from "react";
import { Link } from "react-router";
import { BookMarked, LoaderCircle, Moon, Sun } from "lucide-react";
import { AuthPanel } from "~/components/AuthPanel";
import { SearchBar } from "~/components/SearchBar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { useTheme } from "~/hooks/useTheme";
import { useAuth } from "~/lib/auth-context";

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { status, user, login, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoggedIn = status === "authenticated" && user !== null;
  const isAuthLoading = status === "loading";
  const userLabel = user?.username ?? "User";
  const userId = user?.id ?? null;
  const avatarFallback = useMemo(() => userLabel.slice(0, 2).toUpperCase(), [userLabel]);

  function closeAuthPanels() {
    setDialogOpen(false);
    setDrawerOpen(false);
  }

  async function handleLogout() {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await logout();
      closeAuthPanels();
      setUsername("");
      setPassword("");
    } catch {
      setErrorMessage("Unable to log out. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await login(username.trim(), password);
      closeAuthPanels();
      setPassword("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const authPanel = useMemo(
    () => (
      <AuthPanel
        isLoggedIn={isLoggedIn}
        isSubmitting={submitting}
        username={username}
        password={password}
        errorMessage={errorMessage}
        userLabel={userLabel}
        userId={userId}
        userAvatar={user?.avatar ?? null}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLoginSubmit={handleLoginSubmit}
        onLogout={handleLogout}
      />
    ),
    [
      errorMessage,
      isLoggedIn,
      password,
      submitting,
      user?.avatar,
      userId,
      userLabel,
      username,
    ]
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group"
            aria-label="Koha home"
          >
            <BookMarked className="size-5 text-primary transition-transform group-hover:scale-110" />
            <span className="font-serif text-xl font-semibold tracking-wide text-foreground hidden sm:block">
              Koha
            </span>
          </Link>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          {isLoggedIn ? (
            <SearchBar className="flex-1 max-w-md" />
          ) : (
            <div className="flex-1" />
          )}

          {isAuthLoading ? (
            <Button variant="ghost" size="icon" disabled className="shrink-0">
              <LoaderCircle className="animate-spin" />
            </Button>
          ) : (
            <>
              <div className="hidden md:block">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger
                    render={
                      isLoggedIn ? (
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Avatar size="sm">
                            <AvatarImage src={user?.avatar ?? ""} alt={userLabel} />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                          </Avatar>
                        </Button>
                      ) : (
                        <Button variant="outline">Log in</Button>
                      )
                    }
                  >
                    {isLoggedIn ? <span className="sr-only">Open account panel</span> : "Log in"}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>{isLoggedIn ? "Account" : "Log in to continue"}</DialogTitle>
                      <DialogDescription>
                        {isLoggedIn ? "Manage current session." : "Use your username and password."}
                      </DialogDescription>
                    </DialogHeader>
                    {authPanel}
                  </DialogContent>
                </Dialog>
              </div>

              <div className="md:hidden">
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                  <DrawerTrigger asChild>
                    {isLoggedIn ? (
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar size="sm">
                          <AvatarImage src={user?.avatar ?? ""} alt={userLabel} />
                          <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                      </Button>
                    ) : (
                      <Button variant="outline">Log in</Button>
                    )}
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle>{isLoggedIn ? "Account" : "Log in to continue"}</DrawerTitle>
                      <DrawerDescription>
                        {isLoggedIn ? "Manage current session." : "Use your username and password."}
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-2">
                      {authPanel}
                    </div>
                    <DrawerFooter />
                  </DrawerContent>
                </Drawer>
              </div>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="shrink-0"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
