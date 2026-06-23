import { Link } from "@tanstack/react-router";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { useStrategy } from "./useStrategy";
import { StrategyCard } from "./StrategyCard";
import { DrawButton } from "./DrawButton";

export function ObliqueScreen() {
  const reducedMotion = usePrefersReducedMotion();
  const { data, isPending, isError, isFetching, refetch } = useStrategy();
  const { data: session } = useSession();

  return (
    <main id="main" className="page">
      <nav className="corner-nav">
        {session?.user ? (
          <button type="button" className="link-quiet" onClick={() => void signOut()}>
            sign out
          </button>
        ) : (
          <Link to="/sign-in" className="link-quiet">
            sign in
          </Link>
        )}
      </nav>

      <p className="wordmark">mihrab</p>

      <StrategyCard
        strategy={data}
        isLoading={isPending}
        isError={isError}
        isFetching={isFetching}
        reducedMotion={reducedMotion}
      />

      <div className="page-foot">
        <DrawButton onDraw={() => void refetch()} isFetching={isFetching} />
        <p className="attrib">Oblique Strategies · Brian Eno &amp; Peter Schmidt</p>
      </div>
    </main>
  );
}
