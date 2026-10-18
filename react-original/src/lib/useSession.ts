import { useEffect, useState } from "react";
import { getSession, subscribe, type SessionUser } from "@/lib/auth";

/** Session courante, synchronisée avec le service d'authentification. */
export function useSession(): SessionUser | null {
  const [session, setSession] = useState<SessionUser | null>(() => getSession());

  useEffect(() => {
    const update = () => setSession(getSession());
    update();
    return subscribe(update);
  }, []);

  return session;
}
