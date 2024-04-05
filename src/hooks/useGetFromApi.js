import { get } from "aws-amplify/api";
import { useState, useEffect } from "react";

export const useGetFromApi = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!url) return;
    const getData = async () => {
      try {
        setLoading(true);
        setData(await get({apiName: "backend", path: url}));
      } catch ({ message }) {
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return { data, error, loading };
};
