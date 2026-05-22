import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const useConvexQuery = (action, ...args) => {
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable serialized args key — avoids re-renders from object identity changes
  const argsKey = JSON.stringify(args);

  useEffect(() => {
    // Skip fetching if args contain "skip"
    if (args.some((a) => a === "skip")) {
      setIsLoading(false);
      setData(undefined);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await action(...args);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          // Only show toast for unexpected errors, not auth/empty state
          const msg = err?.message || "";
          const isSilent =
            msg.includes("Unauthorized") ||
            msg.includes("not found") ||
            msg.includes("skip");
          if (!isSilent) {
            toast.error(msg || "An error occurred");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [argsKey]); // Only re-run when serialized args change, NOT on action identity change

  return { data, isLoading, error };
};

export const useConvexMutation = (action) => {
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await action(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message || "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};
