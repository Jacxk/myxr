import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";
import { ErrorToast } from "~/lib/messages/toast.global";

function onError(error: Error) {
  if (error.message === "UNAUTHORIZED") {
    ErrorToast.login();
  } else if (error.message === "INTERNAL_SERVER_ERROR") {
    ErrorToast.internal();
  }
}

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError,
    }),
    mutationCache: new MutationCache({
      onError,
    }),
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000 * 1,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
