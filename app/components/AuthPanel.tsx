import type { FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface AuthPanelProps {
  isLoggedIn: boolean;
  isSubmitting: boolean;
  username: string;
  password: string;
  errorMessage: string | null;
  userLabel: string;
  userId: string | null;
  userAvatar: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLoginSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onLogout: () => Promise<void>;
}

export function AuthPanel({
  isLoggedIn,
  isSubmitting,
  username,
  password,
  errorMessage,
  userLabel,
  userId,
  userAvatar,
  onUsernameChange,
  onPasswordChange,
  onLoginSubmit,
  onLogout,
}: AuthPanelProps) {
  const fallback = userLabel.slice(0, 2).toUpperCase();

  if (!isLoggedIn) {
    return (
      <form className="flex flex-col gap-4" onSubmit={onLoginSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-username">Username</Label>
          <Input
            id="login-username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            autoComplete="username"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
            required
            disabled={isSubmitting}
          />
        </div>
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            username.trim().length === 0 ||
            password.trim().length === 0
          }
        >
          {isSubmitting && (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          )}
          Log in
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <Avatar size="lg">
          <AvatarImage src={userAvatar ?? ""} alt={userLabel} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-sm font-medium text-foreground">
            {userLabel}
          </p>
          {userId && (
            <p className="truncate text-xs text-muted-foreground">{userId}</p>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => void onLogout()}
        disabled={isSubmitting}
      >
        {isSubmitting && (
          <LoaderCircle data-icon="inline-start" className="animate-spin" />
        )}
        Log out
      </Button>
    </div>
  );
}
