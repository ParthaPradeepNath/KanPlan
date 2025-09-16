import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrent = () => {
  const query = useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      const response = await client.api.auth.current.$get();

      if (!response.ok) {
        return null; // need to contantly fetch the current user
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query
};
